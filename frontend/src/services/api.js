import axios from 'axios';

/**
 * Shared Axios instance for all API calls.
 *
 * Responsibilities:
 *  1. Base URL — reads REACT_APP_API_URL, falls back to localhost:8080/api
 *  2. Auth header — automatically attaches the Bearer token from sessionStorage
 *  3. Response unwrapping — the NestJS backend wraps every success response as
 *       { success: true, data: <payload>, timestamp: "..." }
 *     This interceptor unwraps that envelope so all callers read `response.data`
 *     exactly as before (a user array, a bill, a login object, etc.)
 *  4. Error normalisation — on HTTP errors the NestJS HttpExceptionFilter returns
 *       { success: false, statusCode, message, path, timestamp }
 *     This interceptor surfaces `error.response.data.message` consistently.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach the JWT token stored after login for every request.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token'); // stored as "Bearer <jwt>"
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// Unwrap the NestJS { success, data, timestamp } envelope so callers work
// exactly as they did against the old Spring backend.
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (
      body !== null &&
      typeof body === 'object' &&
      'success' in body &&
      'data' in body
    ) {
      // Replace the envelope with the inner payload
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    // Normalise the error message so `error.message` always has something useful
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    // 401 Unauthorized — token is missing, expired or invalid.
    // Clear the session and send the user back to the login page.
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  },
);

export default api;
