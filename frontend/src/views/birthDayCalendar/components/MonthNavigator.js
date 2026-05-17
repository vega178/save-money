import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Popover,
  Grid,
  Button,
} from '@mui/material';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons';
import { useBirthdayContext } from '../context/BirthdayContext';
import { SET_VIEW_MONTH } from '../context/birthdayReducer';

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

const MonthNavigator = () => {
  const { state, dispatch } = useBirthdayContext();
  const { year, month } = state.viewMonth;
  const [anchorEl, setAnchorEl] = useState(null);
  const [pickerYear, setPickerYear] = useState(year);

  const setMonth = (y, m) => dispatch({ type: SET_VIEW_MONTH, payload: { year: y, month: m } });

  const prev = () => {
    if (month === 0) setMonth(year - 1, 11);
    else setMonth(year, month - 1);
  };

  const next = () => {
    if (month === 11) setMonth(year + 1, 0);
    else setMonth(year, month + 1);
  };

  const handlePickMonth = (m) => {
    setMonth(pickerYear, m);
    setAnchorEl(null);
  };

  const label = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton onClick={prev} size="small">
        <IconChevronLeft size={20} />
      </IconButton>

      <Typography
        variant="h6"
        component="button"
        onClick={(e) => { setPickerYear(year); setAnchorEl(e.currentTarget); }}
        sx={{
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          fontWeight: 600,
          minWidth: 160,
          textAlign: 'center',
          '&:hover': { color: 'primary.main' },
        }}
      >
        {label}
      </Typography>

      <IconButton onClick={next} size="small">
        <IconChevronRight size={20} />
      </IconButton>

      {/* Month/Year picker popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, width: 240 }}>
          {/* Year selector */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <IconButton size="small" onClick={() => setPickerYear((y) => y - 1)}>
              <IconChevronLeft size={16} />
            </IconButton>
            <Typography fontWeight={600}>{pickerYear}</Typography>
            <IconButton size="small" onClick={() => setPickerYear((y) => y + 1)}>
              <IconChevronRight size={16} />
            </IconButton>
          </Box>

          {/* Month grid */}
          <Grid container spacing={0.5}>
            {MONTHS.map((name, idx) => (
              <Grid item xs={3} key={name}>
                <Button
                  variant={pickerYear === year && idx === month ? 'contained' : 'text'}
                  size="small"
                  fullWidth
                  onClick={() => handlePickMonth(idx)}
                  sx={{ minWidth: 0, fontSize: '0.75rem' }}
                >
                  {name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Popover>
    </Box>
  );
};

export default MonthNavigator;
