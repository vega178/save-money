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
import { CLOSE_ADD_MODAL, CLOSE_EDIT_MODAL, UPDATE_BIRTHDAY } from '../context/birthdayReducer';
import useBirthdays from '../hooks/useBirthdays';
import ImageDropzone from './ImageDropzone';
import {
  uploadBirthdayPhoto,
  deleteBirthdayPhoto,
  fetchBirthdayPhotoBlob,
} from '../../../services/birthdayService';

const EMPTY = { fullName: '', birthDate: '', notes: '' };

const AddBirthdayModal = ({ userId }) => {
  const { state, dispatch } = useBirthdayContext();
  const { addBirthday, editBirthday } = useBirthdays(userId);

  const isEditMode = state.isEditModalOpen && Boolean(state.editingBirthday);
  const open = state.isAddModalOpen || isEditMode;

  const [form, setForm] = React.useState(EMPTY);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  // Photo state
  const [pendingFile, setPendingFile] = React.useState(null);
  const [existingBlobUrl, setExistingBlobUrl] = React.useState(null);
  const [pendingDelete, setPendingDelete] = React.useState(false);

  // Pre-fill form when opening; fetch existing photo in edit mode
  React.useEffect(() => {
    if (isEditMode && state.editingBirthday) {
      const b = state.editingBirthday;
      setForm({
        fullName: b.fullName || '',
        birthDate: b.birthDate || '',
        notes: b.notes || '',
      });
      if (b.storedPhoto) {
        fetchBirthdayPhotoBlob(b.id).then((url) => setExistingBlobUrl(url));
      } else {
        setExistingBlobUrl(null);
      }
    } else if (state.isAddModalOpen) {
      setForm(EMPTY);
      setExistingBlobUrl(null);
    }
    setPendingFile(null);
    setPendingDelete(false);
    setErrors({});
  }, [state.isAddModalOpen, state.isEditModalOpen, state.editingBirthday]); // eslint-disable-line

  React.useEffect(() => {
    return () => {
      if (existingBlobUrl) URL.revokeObjectURL(existingBlobUrl);
    };
  }, [existingBlobUrl]);

  const handleClose = () => {
    setForm(EMPTY);
    setPendingFile(null);
    setPendingDelete(false);
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
      let saved;
      if (isEditMode) {
        saved = await editBirthday(state.editingBirthday.id, form);
      } else {
        saved = await addBirthday(form);
      }

      const birthdayId = saved?.id ?? state.editingBirthday?.id;

      if (birthdayId) {
        if (pendingDelete && !pendingFile) {
          await deleteBirthdayPhoto(birthdayId);
          // Update context so storedPhoto is cleared
          const base = saved ?? state.editingBirthday;
          if (base) dispatch({ type: UPDATE_BIRTHDAY, payload: { ...base, storedPhoto: null } });
        }
        if (pendingFile) {
          const uploadResult = await uploadBirthdayPhoto(birthdayId, pendingFile);
          // uploadResult is the NestJS-wrapped response: { success, data, timestamp }
          const updated = uploadResult?.data ?? uploadResult;
          if (updated?.id) dispatch({ type: UPDATE_BIRTHDAY, payload: updated });
        }
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
            label="Notes"
            value={form.notes}
            onChange={set('notes')}
            fullWidth
            size="small"
            multiline
            rows={3}
          />

          {/* Circle image dropzone */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
            <ImageDropzone
              pendingFile={pendingFile}
              onChange={(file) => {
                setPendingFile(file);
                if (file) setPendingDelete(false);
              }}
              existingBlobUrl={existingBlobUrl}
              onDelete={() => setPendingDelete(true)}
              pendingDelete={pendingDelete}
            />
          </Box>
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

