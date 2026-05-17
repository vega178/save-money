import React, { useMemo } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import CalendarDay from './CalendarDay';
import useCalendarDays from '../hooks/useCalendarDays';
import { buildBirthdayMap } from '../utils/birthdayMapUtils';
import { useBirthdayContext } from '../context/BirthdayContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarGrid = () => {
  const { state } = useBirthdayContext();
  const { year, month } = state.viewMonth;

  const calendarDays = useCalendarDays(year, month);

  const birthdayMap = useMemo(
    () => buildBirthdayMap(state.birthdays),
    [state.birthdays],
  );

  return (
    <Box>
      {/* Weekday headers */}
      <Grid container columns={7} sx={{ mb: 0.5 }}>
        {WEEKDAYS.map((d) => (
          <Grid item xs={1} key={d}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              align="center"
              display="block"
            >
              {d}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Day cells — 6 rows × 7 cols = 42 */}
      <Grid container columns={7} spacing={0.5}>
        {calendarDays.map((date, idx) => {
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const key = `${mm}-${dd}`;
          return (
            <Grid item xs={1} key={idx}>
              <CalendarDay
                date={date}
                currentMonth={month}
                birthdaysForDay={birthdayMap[key] || []}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default CalendarGrid;
