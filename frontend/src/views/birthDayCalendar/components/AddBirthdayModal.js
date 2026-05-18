import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { IconX } from '@tabler/icons';
import { useBirthdayContext } from '../context/BirthdayContext';
import { CLOSE_ADD_MODAL, CLOSE_EDIT_MODAL } from '../context/birthdayReducer';
import useBirthdays from '../hooks/useBirthdays';

const EMPTY = { fullName: '', birthDate: '', notes: '', photoUrl: '' };

const AddBirthdayModal = ({ userId }) => {
  const { state, dispatch } = useBirthdayContext();
  const { addBirthday, editBirthday } = useBirthdays(userId);

  // Edit mode when isEditModalOpen + editingBirthday are set
  const isEditMode = state.isEditModalOpen && Boolean(state.editingBirthday);
  const open = state.isAddModalOpen || isEditMode;

  const [form, setForm] = React.useState(EMPTY);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  // Pre-fill form when opening in edit mode
  React.useEffect(() => {
    if (isEditMode && state.editingBirthday) {
      const b = state.editingBirthday;
      setForm({
        fullName: b.fullName || '',
        birthDate: b.birthDate || '',
        notes: b.notes || '',
        photoUrl: b.photoUrl || '',
      });
    } else if (state.isAddModalOpen) {
      setForm(EMPTY);
    }
    setErrors({});
  }, [state.isAddModalOpen, state.isEditModalOpen, state.editingBirthday]); // eslint-disable-line

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    dispatch({ type: isEditMode ? CLOSE_EDIT_MODAL : CLOSE_ADD_MODAL });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.birthDate) e.birthDate = 'Birth date is required.';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      if (isEditMode) {
        await editBirthday(state.editingBirthday.id, form);
      } else {
        await addBirthday(form);
      }
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEditMode ? 'Edit Birthday' : 'Add Birthday'}
        <IconButton size="small" onClick={handleClose}>
          <IconX size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            label="Full Name *"
            value={form.fullName}
            onChange={set('fullName')}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName}
            fullWidth
            size="small"
            autoFocus
          />

          <TextField
            label="Birth Date *"
            type="date"
            value={form.birthDate}
            onChange={set('birthDate')}
            error={Boolean(errors.birthDate)}
            helperText={errors.birthDate}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Photo URL"
            value={form.photoUrl}
            onChange={set('photoUrl')}
            fullWidth
            size="small"
            placeholder="https://..."
          />

          <TextField
            label="Notes"
            value={form.notes}
            onChange={set('notes')}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Saving…' : isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBirthdayModal;
