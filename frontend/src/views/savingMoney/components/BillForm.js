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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FileDropzone from './DragAndDropBillsComponent';
import { create, update } from '../../../services/billsServices';

const BillForm = ({ isOpen, onClose, onSave, data, title }) => {
  const isNewBill = !data || !data.id;
  const [file, setFile] = useState(null);
  const [dateValue, setDateValue] = useState(isNewBill ? new Date() : data.billDate);

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

  const handleNumericChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setFormData((prevData) => ({ ...prevData, amount: value }));
    //TODO: Cambiar el numero en el back y bd para que reciba un float y luego si aplicar este cambio , ademas cambiar el tipo de input a text
    /*setFormData((prevData) => ({ ...prevData, amount: formatNumber(value) }));*/
  };

  const formatNumber = (value) => {
    const floatValue = parseFloat(value.replace(/,/g, ''));
    return floatValue.toLocaleString('en-US');
  };

  const handleSaveClick = async () => {
    try {
      if (isNewBill) {
        const createdData = await create(formData);
        onSave(createdData, file);
      } else {
        const updatedDataWithId = {
          id: data.id,
          ...formData,
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
          type="number"
          //type="text"
          value={formData.amount}
          onChange={(e) => handleNumericChange(e)}
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
          type="number"
          value={formData.totalDebt}
          onChange={(e) => setFormData((prevData) => ({ ...prevData, totalDebt: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Actual Debt"
          fullWidth
          type="number"
          value={formData.actualDebt}
          onChange={(e) => setFormData((prevData) => ({ ...prevData, actualDebt: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Total Balance"
          fullWidth
          type="number"
          value={formData.totalBalance}
          onChange={(e) =>
            setFormData((prevData) => ({ ...prevData, totalBalance: e.target.value }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Remaining Amount"
          fullWidth
          type="number"
          value={formData.remainingAmount}
          onChange={(e) =>
            setFormData((prevData) => ({ ...prevData, remainingAmount: e.target.value }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Gap"
          fullWidth
          type="number"
          value={formData.gap}
          onChange={(e) => setFormData((prevData) => ({ ...prevData, gap: e.target.value }))}
          sx={{ mb: 2 }}
        />
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
