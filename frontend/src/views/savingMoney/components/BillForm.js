import React, { useState } from 'react';
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
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import FileDropzone from './DragAndDropBillsComponent';

const BillForm = ({ isOpen, onClose, onSave, data, title }) => {
  const isNewBill = !data;
  const [isDropzoneOpen, setDropzoneOpen] = useState(false);
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [linkTitle , setTitle] = useState();
  const [file, setFile] = useState(null);


  const handleDropzoneOpen = () => {
    setDropzoneOpen(true);
  };

  const handleDropzoneClose = () => {
    setDropzoneOpen(false);
  };

  const handleSave = () => {
    onSave(file);
    onClose();
  };


  return (
    <Dialog open={isOpen} onClose={onClose} sx={{ minWidth: '1000px' }}>
      <DialogTitle>
      <Box sx={{ display: 'flex', mb: 2 }}>
      <Typography variant="h6" fontWeight={600} sx={{  textAlign: 'left' }}>
          {title}
        </Typography>
        <Button style={{ position: 'absolute', right: '8px', top: '8px' }} onClick={onClose}>
          <CloseIcon />
        </Button>
      </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          label="Date"
          fullWidth
          type="date"
          value={isNewBill ? format(new Date(), 'yyyy-MM-dd') : format(data.billDate, 'yyyy-MM-dd')}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => {
            // Handle date change
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Name"
          fullWidth
          multiline
          value={isNewBill ? '' : data.name}
          onChange={(e) => {
            // Handle name change
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Amount"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.amount}
          onChange={(e) => {
            // Handle amount change
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Total Debt"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.totalDebt}
          onChange={(e) => {
            // Handle totalDebt change
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Actual Debt"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.actualDebt}
          onChange={(e) => {
            // Handle actualDebt change
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Total Balance"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.totalBalance}
          onChange={(e) => {
            // Handle actualDebt change
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Remaining Amount"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.remainingAmount}
          onChange={(e) => {
            // Handle actualDebt change
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Gap"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.gap}
          onChange={(e) => {
            // Handle actualDebt change
          }}
          sx={{ mb: 2 }}
        />
        <FileDropzone onSave={(uploadedFile, filePreview) => setFile(uploadedFile)} />
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="error" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillForm;
