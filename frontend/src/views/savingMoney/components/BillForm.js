import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Refresh as RefreshIcon, Undo as UndoIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FileDropzone from './DragAndDropBillsComponent';
import {
  createBillByUserId,
  update,
  uploadDocumentToBill,
  getDocumentsByBillId,
  deleteDocument,
  replaceDocument,
  openDocumentInNewTab,
} from '../../../services/billsServices';

const BillForm = ({ isOpen, onClose, onSave, data, items, title, user }) => {
  const isNewBill = !data || !data.id;
  const [file, setFile] = useState(null);
  // documentAction: null = add new | { type: 'replace', docId } = replace existing
  const [documentAction, setDocumentAction] = useState(null);
  // pendingDeletes: Set of docIds staged for deletion — committed on Save, discarded on Cancel
  const [pendingDeletes, setPendingDeletes] = useState(new Set());
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [dateValue, setDateValue] = useState(isNewBill ? new Date() : data.billDate);
  const [useExistingValue, setUseExistingValue] = useState(false);
  const [selectedExistingBill, setSelectedExistingBill] = useState('');

  const handleUseExistingValueChange = (event) => {
    setUseExistingValue(event.target.checked);
    if (!event.target.checked) {
      updateFormData();
      setSelectedExistingBill('');
    }
  };

  const handleExistingBillChange = (event) => {
    const selectedBillName = event.target.value;
    setSelectedExistingBill(selectedBillName);
  
    const selectedBillDetails = items.find((bill) => bill.name === selectedBillName);
  
    if (selectedBillDetails != null) {
      const billDate = new Date(selectedBillDetails.billDate);
      setFormData({
        ...initialFormData,
        billDate: billDate,
        name: selectedBillDetails.name || "",
        amount: selectedBillDetails.amount || 0,
        totalDebt: selectedBillDetails.totalDebt || 0,
        actualDebt: selectedBillDetails.actualDebt || 0,
        totalBalance: selectedBillDetails.totalBalance || 0,
        remainingAmount: selectedBillDetails.remainingAmount || 0,
      });
    } else {
      setDateValue(new Date()); 
      setFormData(initialFormData);
    }
  };

  const initialFormData = {
    billDate: isNewBill ? new Date() : data.billDate,
    name: '',
    amount: 0,
    totalDebt: 0,
    actualDebt: 0,
    totalBalance: 0,
    remainingAmount: 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  const updateFormData = () => {
    if (isNewBill) {
      setFormData(initialFormData);
    } else {
      setFormData({
        billDate: dateValue,
        name: data.name || '',
        amount: data.amount || 0,
        totalDebt: data.totalDebt || 0,
        actualDebt: data.actualDebt || 0,
        totalBalance: data.totalBalance || 0,
        remainingAmount: data.remainingAmount || 0,
      });
    }
  };

  useEffect(() => {
    updateFormData();
  }, [data]);

  // Fetch existing documents whenever an existing bill is opened
  useEffect(() => {
    if (!isNewBill && isOpen && data?.id) {
      setDocsLoading(true);
      getDocumentsByBillId(data.id)
        .then((res) => setExistingDocuments(Array.isArray(res?.data) ? res.data : []))
        .catch(() => setExistingDocuments([]))
        .finally(() => setDocsLoading(false));
    } else {
      setExistingDocuments([]);
    }
    // Reset ALL pending document changes whenever the dialog opens/closes or bill changes
    setFile(null);
    setDocumentAction(null);
    setPendingDeletes(new Set());
  }, [isOpen, data?.id]);

  const handleDateChange = (date) => {
    setDateValue(date);
    setFormData((prevData) => ({ ...prevData, billDate: date }));
  };

  const handleNumericChange = (e, field) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setFormData((prevData) => ({ ...prevData, [field]: formatNumber(value) }));
  };

  const formatNumber = (value) => {
    if (value.trim() === '') {
      return value;
    }
    const cleanedValue = value.replace(/,/g, '');
    const floatValue = parseFloat(cleanedValue);
    return !isNaN(floatValue) ? floatValue.toLocaleString('en-US') : value;
  };

  const removeFormatFromFormFields = (formValues) => {
    const numericFields = [
      'amount',
      'totalDebt',
      'actualDebt',
      'totalBalance',
      'remainingAmount',
    ];

    const unformattedFormValues = { ...formValues };

    numericFields.forEach((field) => {
      if (unformattedFormValues[field] !== undefined) {
        // Strip thousand-separator commas then coerce to a real Number so the
        // API receives 11212 instead of the string "11,212" or "11212".
        const cleaned = String(unformattedFormValues[field]).replace(/,/g, '');
        const parsed = parseFloat(cleaned);
        unformattedFormValues[field] = isNaN(parsed) ? 0 : parsed;
      }
    });

    return unformattedFormValues;
  };

  const handleSaveClick = async () => {
    try {
      const unformattedFormData = removeFormatFromFormFields({
        ...formData,
        billDate: dateValue,
      });

      let savedBill;
      if (isNewBill) {
        savedBill = await createBillByUserId(user, unformattedFormData);
      } else {
        const updatedDataWithId = { id: data.id, ...unformattedFormData };
        await update(updatedDataWithId);
        savedBill = updatedDataWithId;
      }

      // Commit staged deletes
      for (const docId of pendingDeletes) {
        await deleteDocument(savedBill.id, docId);
      }

      // Upload or replace the document after the bill is persisted
      if (file && savedBill?.id) {
        if (documentAction?.type === 'replace' && documentAction?.docId) {
          await replaceDocument(savedBill.id, documentAction.docId, file);
        } else {
          await uploadDocumentToBill(savedBill.id, file);
        }
      }

      setFile(null);
      setDocumentAction(null);
      setPendingDeletes(new Set());
      onSave(savedBill);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  // Stage a delete — does NOT call the API yet. Toggling again undoes the staging.
  const handleDeleteDocument = (docId) => {
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId); // undo staging
      } else {
        next.add(docId);    // stage for deletion
        // If this doc was staged for replace, cancel that too
        if (documentAction?.type === 'replace' && documentAction?.docId === docId) {
          setDocumentAction(null);
          setFile(null);
        }
      }
      return next;
    });
  };

  const handleReplaceDocument = (docId) => {
    setDocumentAction({ type: 'replace', docId });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} sx={{ minWidth: '1000px' }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ textAlign: 'left' }}>
            {title}
          </Typography>
          <Button style={{ position: 'absolute', right: '8px', top: '8px' }} onClick={onClose}>
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date"
            value={dateValue}
            onChange={handleDateChange}
            renderInput={(params) => <TextField fullWidth sx={{ mb: 2 }} {...params} />}
          />
        </LocalizationProvider>
        <TextField
          label="Name"
          fullWidth
          multiline
          value={formData.name}
          onChange={(e) => setFormData((prevData) => ({ ...prevData, name: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Amount"
          fullWidth
          type="text"
          value={formData.amount}
          onChange={(e) => handleNumericChange(e, 'amount')}
          onFocus={() => {
            if (formData.amount === 0) {
              setFormData((prevData) => ({ ...prevData, amount: '' }));
            }
          }}
          onBlur={() => {
            if (formData.amount === '') {
              setFormData((prevData) => ({ ...prevData, amount: 0 }));
            }
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          //TODO: REVISAR EL CALCULO YA QUE NO SE ESTA RE CALCULANDO CUANDO SE GUARDA PARA EL SIGUIENTE MES.
          label="Total Debt"
          fullWidth
          type="text"
          value={formData.totalDebt}
          onChange={(e) => handleNumericChange(e, 'totalDebt')}
          onFocus={() => {
            if (formData.totalDebt === 0) {
              setFormData((prevData) => ({ ...prevData, totalDebt: '' }));
            }
          }}
          onBlur={() => {
            if (formData.totalDebt === '') {
              setFormData((prevData) => ({ ...prevData, totalDebt: 0 }));
            }
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Actual Debt"
          disabled
          type="text"
          value={formData.actualDebt}
          onChange={(e) => handleNumericChange(e, 'actualDebt')}
          onFocus={() => {
            if (formData.actualDebt === 0) {
              setFormData((prevData) => ({ ...prevData, actualDebt: '' }));
            }
          }}
          onBlur={() => {
            if (formData.actualDebt === '') {
              setFormData((prevData) => ({ ...prevData, actualDebt: 0 }));
            }
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Total Balance"
          fullWidth
          type="text"
          value={formData.totalBalance}
          onChange={(e) => handleNumericChange(e, 'totalBalance')}
          onFocus={() => {
            if (formData.totalBalance === 0) {
              setFormData((prevData) => ({ ...prevData, totalBalance: '' }));
            }
          }}
          onBlur={() => {
            if (formData.totalBalance === '') {
              setFormData((prevData) => ({ ...prevData, totalBalance: 0 }));
            }
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Remaining Amount"
          disabled
          fullWidth
          type="text"
          value={formData.remainingAmount}
          onChange={(e) => handleNumericChange(e, 'remainingAmount')}
          onFocus={() => {
            if (formData.remainingAmount === 0) {
              setFormData((prevData) => ({ ...prevData, remainingAmount: '' }));
            }
          }}
          onBlur={() => {
            if (formData.remainingAmount === '') {
              setFormData((prevData) => ({ ...prevData, remainingAmount: 0 }));
            }
          }}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          sx={{ display: 'block', mb: 1 }}
          control={
            <Checkbox
              checked={useExistingValue}
              onChange={handleUseExistingValueChange}
              disabled={!items || items.length === 0 || !isNewBill}
            />
          }
          label="Use Existing Bill"
        />
        {useExistingValue && (
          <>
            <Select
              value={selectedExistingBill}
              onChange={handleExistingBillChange}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                Select an existing bill
              </MenuItem>
              {Array.isArray(items) &&
                // Deduplicate by name keeping the most recent entry per bill name.
                // A Map keyed by name is iterated in insertion order; since items
                // arrive sorted ascending by date, each repeated name overwrites
                // the previous one — leaving only the latest occurrence per name.
                Array.from(
                  new Map(items.map((b) => [b.name, b])).values()
                ).map((bill) => (
                  <MenuItem key={bill.id} value={bill.name}>
                    {bill.name}
                  </MenuItem>
                ))}
            </Select>
          </>
        )}
        {/* ── Existing documents (edit mode only) ─────────────────────── */}
        {!isNewBill && (
          <Box sx={{ mb: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Attached Documents
              {docsLoading && <CircularProgress size={14} sx={{ ml: 1 }} />}
              {pendingDeletes.size > 0 && (
                <Chip
                  label={`${pendingDeletes.size} pending delete${pendingDeletes.size > 1 ? 's' : ''}`}
                  color="error"
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1, fontSize: '0.65rem' }}
                />
              )}
            </Typography>
            {!docsLoading && existingDocuments.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No documents attached yet.
              </Typography>
            )}
            {existingDocuments.length > 0 && (
              <List dense disablePadding>
                {existingDocuments.map((doc) => {
                  const stagedForDelete = pendingDeletes.has(doc.id);
                  return (
                    <ListItem
                      key={doc.id}
                      disablePadding
                      sx={{
                        mb: 0.5,
                        border: `1px solid ${stagedForDelete ? '#f44336' : '#e0e0e0'}`,
                        borderRadius: 1,
                        px: 1,
                        opacity: stagedForDelete ? 0.5 : 1,
                        background: stagedForDelete ? '#fff5f5' : undefined,
                      }}
                    >
                      <ListItemText
                        primary={doc.originalName}
                        secondary={
                          stagedForDelete
                            ? 'Will be deleted on Save — click ↩ to undo'
                            : `${(doc.sizeBytes / 1024).toFixed(1)} KB · ${new Date(doc.uploadedAt).toLocaleDateString()}`
                        }
                        primaryTypographyProps={{
                          variant: 'body2',
                          noWrap: true,
                          style: stagedForDelete ? { textDecoration: 'line-through' } : {},
                        }}
                        secondaryTypographyProps={{ variant: 'caption', color: stagedForDelete ? 'error' : 'text.secondary' }}
                      />
                      <ListItemSecondaryAction>
                        {/* View — disabled when staged for delete */}
                        <IconButton
                          size="small"
                          title="View"
                          disabled={stagedForDelete}
                          onClick={() => openDocumentInNewTab(data.id, doc.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {/* Replace — disabled when staged for delete */}
                        <IconButton
                          size="small"
                          title="Replace"
                          disabled={stagedForDelete}
                          color={documentAction?.docId === doc.id ? 'primary' : 'default'}
                          onClick={() => handleReplaceDocument(doc.id)}
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                        {/* Delete / Undo — toggles staging */}
                        <IconButton
                          size="small"
                          title={stagedForDelete ? 'Undo delete' : 'Delete'}
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          {stagedForDelete
                            ? <UndoIcon fontSize="small" color="warning" />
                            : <DeleteIcon fontSize="small" color="error" />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )}
            <Divider sx={{ mt: 1, mb: 2 }} />
          </Box>
        )}

        {/* ── Dropzone label changes when in replace mode ───────────────── */}
        {documentAction?.type === 'replace' && (
          <Chip
            label={`Replacing: ${existingDocuments.find((d) => d.id === documentAction.docId)?.originalName ?? 'document'}`}
            onDelete={() => { setDocumentAction(null); setFile(null); }}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
          />
        )}

        <FileDropzone
          onSave={(uploadedFile) => setFile(uploadedFile)}
          pendingFile={file}
        />
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="error" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSaveClick} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillForm;
