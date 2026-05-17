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

export const createBirthday = async (userId, { fullName, birthDate, notes, photoUrl }) => {
  try {
    return await api.post(`/users/${userId}/birthdays`, {
      fullName,
      birthDate,
      notes,
      photoUrl,
    });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

export const updateBirthday = async (id, { fullName, birthDate, notes, photoUrl }) => {
  try {
    return await api.put(`/birthdays/${id}`, { fullName, birthDate, notes, photoUrl });
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
