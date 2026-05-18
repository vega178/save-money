import React, { useEffect } from 'react';
import { Grid, Box, Button, Stack, Typography } from '@mui/material';
import { IconPlus } from '@tabler/icons';
import PageContainer from 'src/components/container/PageContainer';

import { BirthdayProvider, useBirthdayContext } from './context/BirthdayContext';
import { OPEN_ADD_MODAL } from './context/birthdayReducer';
import useBirthdays from './hooks/useBirthdays';

import MonthNavigator from './components/MonthNavigator';
import CalendarGrid from './components/CalendarGrid';
import AddBirthdayModal from './components/AddBirthdayModal';
import BirthdayDetailsModal from './components/BirthdayDetailsModal';
import BirthdayNotifications from './components/BirthdayNotifications';

// ── Inner component (needs access to context) ─────────────────────────────────
const BirthdayCalendarInner = () => {
  let userId = sessionStorage.getItem('userId');
  const { dispatch } = useBirthdayContext();
  const { loadBirthdays, loadNotifications } = useBirthdays(userId);

  useEffect(() => {
    if (userId) {
      loadBirthdays();
      loadNotifications();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageContainer title="Birthday Calendar" description="Track birthdays for people you care about">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Login-time notifications */}
            <BirthdayNotifications />

            {/* Page header row */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography variant="h5" fontWeight={700}>
                Birthday Calendar
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => dispatch({ type: OPEN_ADD_MODAL })}
              >
                Add
              </Button>
            </Stack>

            {/* Month navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <MonthNavigator />
            </Box>

            {/* Calendar grid */}
            <CalendarGrid />
          </Grid>
        </Grid>
      </Box>

      {/* Modals */}
      <AddBirthdayModal userId={userId} />
      <BirthdayDetailsModal userId={userId} />
    </PageContainer>
  );
};

// ── Page entry — wraps inner with provider ────────────────────────────────────
const BirthDayCalendar = () => (
  <BirthdayProvider>
    <BirthdayCalendarInner />
  </BirthdayProvider>
);

export default BirthDayCalendar;