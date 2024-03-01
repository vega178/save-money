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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FileDropzone from './DragAndDropBillsComponent';
import { create, update } from '../../../services/billsServices';

const BillForm = ({ isOpen, onClose, onSave, data, items, title }) => {
  const isNewBill = !data || !data.id;
  const [file, setFile] = useState(null);
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
      setFormData({
        ...initialFormData,
        name: selectedBillDetails.name || "",
        amount: selectedBillDetails.amount || 0,
        totalDebt: selectedBillDetails.totalDebt || 0,
        actualDebt: selectedBillDetails.actualDebt || 0,
        totalBalance: selectedBillDetails.totalBalance || 0,
        remainingAmount: selectedBillDetails.remainingAmount || 0,
        gap: selectedBillDetails.gap || 0,
      });
    } else {
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
    gap: 0,
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
        gap: data.gap || 0,
      });
    }
  };

  useEffect(() => {
    updateFormData();
  }, [dateValue, data]);

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
    const formattedFields = [
      'amount',
      'totalDebt',
      'actualDebt',
      'totalBalance',
      'remainingAmount',
      'gap',
    ];

    const unformattedFormValues = { ...formValues };

    formattedFields.forEach((field) => {
      if (
        unformattedFormValues[field] !== undefined &&
        typeof unformattedFormValues[field] === 'string'
      ) {
        unformattedFormValues[field] = unformattedFormValues[field].replace(/,/g, '');
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

      if (isNewBill) {
        const createdData = await create(unformattedFormData);
        onSave(createdData, file);
      } else {
        const updatedDataWithId = {
          id: data.id,
          ...unformattedFormData,
        };
        await update(updatedDataWithId);
        onSave(updatedDataWithId, file);
      }

      setFile(null);
      onSave(formData, file);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
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
        <TextField
          //TODO: Calculo valor ingresado (Sumatoria de todos los valores ingresados por el mes actual - Obligation Average)
          label="Gap"
          fullWidth
          type="text"
          value={formData.gap}
          onChange={(e) => handleNumericChange(e, 'gap')}
          onFocus={() => {
            if (formData.gap === 0) {
              setFormData((prevData) => ({ ...prevData, gap: '' }));
            }
          }}
          onBlur={() => {
            if (formData.gap === '') {
              setFormData((prevData) => ({ ...prevData, gap: 0 }));
            }
          }}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={<Checkbox checked={useExistingValue} onChange={handleUseExistingValueChange} />}
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
                items.map((bill) => (
                  <MenuItem key={bill.id} value={bill.name}>
                    {bill.name}
                  </MenuItem>
              ))}
            </Select>
          </>
        )}
        <FileDropzone onSave={(uploadedFile) => setFile(uploadedFile)} />
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
