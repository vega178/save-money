import React, { memo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import BirthdayChip from './BirthdayChip';
import { useBirthdayContext } from '../context/BirthdayContext';
import { OPEN_DETAILS } from '../context/birthdayReducer';

const MAX_VISIBLE = 2;

const CalendarDay = memo(({ date, currentMonth, birthdaysForDay = [] }) => {
  const { dispatch } = useBirthdayContext();
  const isToday = date.toDateString() === new Date().toDateString();
  const isCurrentMonth = date.getMonth() === currentMonth;

  const visible = birthdaysForDay.slice(0, MAX_VISIBLE);
  const overflow = birthdaysForDay.length - MAX_VISIBLE;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minHeight: 90,
        p: 0.5,
        backgroundColor: isToday
          ? 'primary.light'
          : isCurrentMonth
          ? 'background.paper'
          : 'action.hover',
        opacity: isCurrentMonth ? 1 : 0.45,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="caption"
        fontWeight={isToday ? 700 : 400}
        color={isToday ? 'primary.contrastText' : 'text.primary'}
        sx={{ lineHeight: 1.2 }}
      >
        {date.getDate()}
      </Typography>

      {visible.map((b, i) => (
        <BirthdayChip
          key={b.id}
          birthday={b}
          dayBirthdays={birthdaysForDay}
          initialIndex={i}
        />
      ))}

      {overflow > 0 && (
        <Chip
          size="small"
          label={`+${overflow} more`}
          variant="outlined"
          onClick={() =>
            dispatch({
              type: OPEN_DETAILS,
              payload: { dayBirthdays: birthdaysForDay, initialIndex: MAX_VISIBLE },
            })
          }
          sx={{ cursor: 'pointer', fontSize: '0.65rem', height: 18 }}
        />
      )}
    </Box>
  );
});

export default CalendarDay;
