import React from 'react';
import { Alert, AlertTitle, Stack, IconButton, Collapse } from '@mui/material';
import { IconX } from '@tabler/icons';
import { useBirthdayContext } from '../context/BirthdayContext';
import { DISMISS_NOTIFICATION } from '../context/birthdayReducer';

const BirthdayNotifications = () => {
  const { state, dispatch } = useBirthdayContext();
  const { todayBirthdays, upcomingBirthdays } = state.notifications;

  if (!todayBirthdays.length && !upcomingBirthdays.length) return null;

  const dismiss = (id) => dispatch({ type: DISMISS_NOTIFICATION, payload: id });

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {todayBirthdays.map((b) => (
        <Collapse in key={b.id}>
          <Alert
            severity="success"
            action={
              <IconButton size="small" onClick={() => dismiss(b.id)}>
                <IconX size={16} />
              </IconButton>
            }
          >
            <AlertTitle>🎂 Happy Birthday!</AlertTitle>
            Today is <strong>{b.fullName}</strong>'s birthday!
          </Alert>
        </Collapse>
      ))}
      {upcomingBirthdays.map(({ birthday, daysUntil }) => (
        <Collapse in key={birthday.id}>
          <Alert
            severity="info"
            action={
              <IconButton size="small" onClick={() => dismiss(birthday.id)}>
                <IconX size={16} />
              </IconButton>
            }
          >
            <AlertTitle>Upcoming Birthday</AlertTitle>
            <strong>{birthday.fullName}</strong>'s birthday is in{' '}
            <strong>{daysUntil} day{daysUntil !== 1 ? 's' : ''}</strong>.
          </Alert>
        </Collapse>
      ))}
    </Stack>
  );
};

export default BirthdayNotifications;
