/**
 * birthdayService.js
 *
 * All paths are relative to the baseURL configured in api.js
 * (REACT_APP_API_URL or http://localhost:8080/api).
 *
 * The shared `api` instance handles:
 *   - Attaching the Authorization header automatically
 *   - Unwrapping the NestJS { success, data, timestamp } response envelope
 */
import api from './api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const getBirthdaysByUserId = async (userId) => {
  try {
    return await api.get(`/users/${userId}/birthdays`);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getUpcomingBirthdays = async (userId, days = 7) => {
  try {
    return await api.get(`/users/${userId}/birthdays/upcoming?days=${days}`);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const createBirthday = async (userId, { fullName, birthDate, notes }) => {
  try {
    return await api.post(`/users/${userId}/birthdays`, {
      fullName,
      birthDate,
      notes,
    });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

export const updateBirthday = async (id, { fullName, birthDate, notes }) => {
  try {
    return await api.put(`/birthdays/${id}`, { fullName, birthDate, notes });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

export const removeBirthday = async (id) => {
  try {
    return await api.delete(`/birthdays/${id}`);
  } catch (error) {
    console.log(error);
  }
};

// ── Photo endpoints ────────────────────────────────────────────────────────────

/**
 * Upload (or replace) the photo for a birthday.
 * Uses raw fetch so we can send multipart/form-data without Axios stripping the boundary.
 */
export const uploadBirthdayPhoto = async (birthdayId, file) => {
  const token = sessionStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/birthdays/${birthdayId}/photo`, {
    method: 'POST',
    headers: { Authorization: token },
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload photo failed: ${res.status}`);
  return res.json();
};

/** Delete the uploaded photo for a birthday. */
export const deleteBirthdayPhoto = async (birthdayId) => {
  try {
    return await api.delete(`/birthdays/${birthdayId}/photo`);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Fetch the birthday photo as a blob URL for in-page display (avoids 401 with window.open).
 * Returns null if the birthday has no stored photo.
 */
export const fetchBirthdayPhotoBlob = async (birthdayId) => {
  const token = sessionStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/birthdays/${birthdayId}/photo`, {
    headers: { Authorization: token },
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

