/**
 * userService.js
 *
 * All paths are relative to the baseURL configured in api.js
 * (REACT_APP_API_URL or http://localhost:8080/api).
 *
 * The shared `api` instance handles:
 *   - Attaching the Authorization header automatically
 *   - Unwrapping the NestJS { success, data, timestamp } response envelope
 */
import api from './api';

export const getUsers = async () => {
  try {
    return await api.get('/users');
  } catch (error) {
    console.log(error);
  }
  return null;
}

export const createUser = async({ username, email, password }) => {
  return await api.post('/users', { username, email, password });
}

/**
 * login — posts to /api/auth/login (NestJS AuthController).
 * Spring Boot used the form-login default at /login; NestJS exposes /auth/login.
 * The response shape { token, username, message } is identical.
 */
export const login = async({ username, password }) => {
  return await api.post('/auth/login', { username, password });
}

export const updateUser = async({ id, username, email }) => {
  try {
    return await api.put(`/users/${id}`, { username, email });
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const deleteUser = async(id) => {
  try {
    return await api.delete(`/users/${id}`);
  } catch (error) {
    console.log(error);
  }
}