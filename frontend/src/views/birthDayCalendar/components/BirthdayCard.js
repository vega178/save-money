import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import { IconCake, IconNote } from '@tabler/icons';
import { formatBirthDate, turningAge, daysUntilBirthday } from '../utils/dateUtils';

const BirthdayCard = ({ birthday }) => {
  if (!birthday) return null;

  const initials = birthday.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const age = turningAge(birthday.birthDate);
  const daysLeft = daysUntilBirthday(birthday.birthDate);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        p: 2,
        minWidth: 260,
      }}
    >
      <Avatar
        src={birthday.photoUrl || undefined}
        alt={birthday.fullName}
        sx={{ width: 90, height: 90, fontSize: '1.6rem' }}
      >
        {!birthday.photoUrl && initials}
      </Avatar>

      <Box textAlign="center">
        <Typography variant="h6" fontWeight={700}>
          {birthday.fullName}
        </Typography>
        <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} justifyContent="center">
          <IconCake size={15} />
          {formatBirthDate(birthday.birthDate)}
        </Typography>
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
        <Chip
          size="small"
          label={daysLeft === 0 ? '🎂 Today!' : `In ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
          color={daysLeft === 0 ? 'success' : 'primary'}
          variant={daysLeft === 0 ? 'filled' : 'outlined'}
        />
        <Chip
          size="small"
          label={`Turning ${age}`}
          variant="outlined"
        />
      </Box>

      {birthday.notes && (
        <>
          <Divider flexItem />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}
          >
            <IconNote size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            {birthday.notes}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default BirthdayCard;
