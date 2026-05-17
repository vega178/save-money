import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconEdit,
} from '@tabler/icons';
import { useBirthdayContext } from '../context/BirthdayContext';
import {
  CLOSE_DETAILS,
  SLIDE_NEXT,
  SLIDE_PREV,
  OPEN_EDIT_MODAL,
} from '../context/birthdayReducer';
import BirthdayCard from './BirthdayCard';
import useBirthdays from '../hooks/useBirthdays';

const BirthdayDetailsModal = ({ userId }) => {
  const { state, dispatch } = useBirthdayContext();
  const { isDetailsModalOpen, detailsTarget } = state;
  const { deleteBirthday } = useBirthdays(userId);

  // Keyboard navigation
  useEffect(() => {
    if (!isDetailsModalOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') dispatch({ type: SLIDE_NEXT });
      if (e.key === 'ArrowLeft') dispatch({ type: SLIDE_PREV });
      if (e.key === 'Escape') dispatch({ type: CLOSE_DETAILS });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDetailsModalOpen, dispatch]);

  if (!detailsTarget) return null;

  const { dayBirthdays, activeIndex } = detailsTarget;
  const current = dayBirthdays[activeIndex];
  const isMultiple = dayBirthdays.length > 1;

  const handleDelete = async () => {
    await deleteBirthday(current.id);
  };

  const handleEdit = () => {
    dispatch({ type: OPEN_EDIT_MODAL, payload: current });
    dispatch({ type: CLOSE_DETAILS });
  };

  return (
    <Dialog
      open={isDetailsModalOpen}
      onClose={() => dispatch({ type: CLOSE_DETAILS })}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {isMultiple ? `${activeIndex + 1} / ${dayBirthdays.length}` : 'Birthday'}
        </Typography>
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={handleEdit} color="primary">
              <IconEdit size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={handleDelete} color="error">
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => dispatch({ type: CLOSE_DETAILS })}>
            <IconX size={18} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <BirthdayCard birthday={current} />
      </DialogContent>

      {/* Slider navigation — only when multiple birthdays share the day */}
      {isMultiple && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, pb: 1.5 }}
        >
          <IconButton
            onClick={() => dispatch({ type: SLIDE_PREV })}
            disabled={activeIndex === 0}
          >
            <IconChevronLeft />
          </IconButton>
          <Box display="flex" gap={0.5}>
            {dayBirthdays.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: i === activeIndex ? 'primary.main' : 'action.disabled',
                }}
              />
            ))}
          </Box>
          <IconButton
            onClick={() => dispatch({ type: SLIDE_NEXT })}
            disabled={activeIndex === dayBirthdays.length - 1}
          >
            <IconChevronRight />
          </IconButton>
        </Box>
      )}
    </Dialog>
  );
};

export default BirthdayDetailsModal;
