import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import { IconCake, IconNote, IconHeart } from '@tabler/icons';
import { formatBirthDate, turningAge, daysUntilBirthday } from '../utils/dateUtils';
import { fetchBirthdayPhotoBlob } from '../../../services/birthdayService';

const isMemorialDate = (fullName) =>
  /fallecimiento/i.test(fullName ?? '');

const BirthdayCard = ({ birthday }) => {
  const [photoBlobUrl, setPhotoBlobUrl] = React.useState(null);
  React.useEffect(() => {
    let active = true;
    let objUrl = null;
    if (birthday?.storedPhoto) {
      fetchBirthdayPhotoBlob(birthday.id).then((url) => {
        if (active) { objUrl = url; setPhotoBlobUrl(url); }
      });
    } else {
      setPhotoBlobUrl(null);
    }
    return () => {
      active = false;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [birthday?.id, birthday?.storedPhoto]);

  if (!birthday) return null;

  const initials = birthday.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const age = turningAge(birthday.birthDate);
  const daysLeft = daysUntilBirthday(birthday.birthDate);
  const avatarSrc = photoBlobUrl || birthday.photoUrl || undefined;
  const memorial = isMemorialDate(birthday.fullName);

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
        src={avatarSrc}
        alt={birthday.fullName}
        sx={{ width: 90, height: 90, fontSize: '1.6rem' }}
      >
        {!avatarSrc && initials}
      </Avatar>

      <Box textAlign="center">
        <Typography variant="h6" fontWeight={700}>
          {birthday.fullName}
        </Typography>
        <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} justifyContent="center">
          {memorial
            ? <IconHeart size={15} fill="#e53935" style={{ color: '#e53935' }} />
            : <IconCake size={15} />}
          {formatBirthDate(birthday.birthDate)}
        </Typography>
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
        <Chip
          size="small"
          label={
            memorial
              ? (daysLeft === 0 ? '❤️ Today' : `In ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`)
              : (daysLeft === 0 ? '🎂 Today!' : `In ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`)
          }
          color={daysLeft === 0 ? (memorial ? 'error' : 'success') : 'primary'}
          variant={daysLeft === 0 ? 'filled' : 'outlined'}
        />
        {!memorial && (
          <Chip
            size="small"
            label={`Turning ${age}`}
            variant="outlined"
          />
        )}
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
