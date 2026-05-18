import React from 'react';
import { Chip, Avatar } from '@mui/material';
import { useBirthdayContext } from '../context/BirthdayContext';
import { OPEN_DETAILS } from '../context/birthdayReducer';
import { todayMonthDayKey, toMonthDayKey } from '../utils/dateUtils';

const BirthdayChip = ({ birthday, dayBirthdays, initialIndex }) => {
  const { dispatch } = useBirthdayContext();
  const isToday = toMonthDayKey(birthday.birthDate) === todayMonthDayKey();

  const handleClick = () => {
    dispatch({
      type: OPEN_DETAILS,
      payload: { dayBirthdays, initialIndex },
    });
  };

  const initials = birthday.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Chip
      size="small"
      label={birthday.fullName.split(' ')[0]}
      color={isToday ? 'primary' : 'default'}
      avatar={
        birthday.photoUrl ? (
          <Avatar src={birthday.photoUrl} alt={birthday.fullName} />
        ) : (
          <Avatar sx={{ fontSize: '0.6rem' }}>{initials}</Avatar>
        )
      }
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        mb: 0.25,
        maxWidth: '100%',
        '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
      }}
    />
  );
};

export default BirthdayChip;
