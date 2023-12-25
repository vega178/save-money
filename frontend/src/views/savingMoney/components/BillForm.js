import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
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

const BillForm = ({ isOpen, onClose, onSave, data }) => {
  const isNewBill = !data;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        {isNewBill ? (
          <Typography variant="h6" fontWeight={600} align="center">
            New Bill
          </Typography>
        ) : (
          data.name
        )}
        <Button style={{ position: 'absolute', right: '8px', top: '8px' }} onClick={onClose}>
          <CloseIcon />
        </Button>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Date"
          fullWidth
          type="date"
          value={isNewBill ? format(new Date(), 'yyyy-MM-dd') : format(data.billDate, 'yyyy-MM-dd')}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => {
            // Handle date change
          }}
        />
        <TextField
          label="Name"
          fullWidth
          multiline
          value={isNewBill ? '' : data.name}
          onChange={(e) => {
            // Handle name change
          }}
        />
        <TextField
          label="Amount"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.amount}
          onChange={(e) => {
            // Handle amount change
          }}
        />
        <TextField
          label="Total Debt"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.totalDebt}
          onChange={(e) => {
            // Handle totalDebt change
          }}
        />
        <TextField
          label="Actual Debt"
          fullWidth
          type="number"
          value={isNewBill ? '' : data.actualDebt}
          onChange={(e) => {
            // Handle actualDebt change
          }}
        />
        {/* Agrega más campos numéricos según tus necesidades */}
      </DialogContent>
      <DialogActions>
        <Button  onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillForm;
