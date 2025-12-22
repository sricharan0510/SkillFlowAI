import api from './axios';

export const registerUser = (data) =>
  api.post('/auth/register', data);

export const verifyOtp = (data) =>
  api.post('/auth/verify-email', data);

export const loginUser = (data) =>
  api.post('/auth/login', data);

export const forgotPassword = (data) =>
  api.post('/auth/forgot-password', data);

export const resetPassword = (data) =>
  api.post('/auth/reset-password', data);

export const resendOtp = (data) =>
  api.post('/auth/resend-otp', data);

export const getMe = (token) =>
  api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const refreshToken = () =>
  api.post('/auth/refresh-token');

export const logoutUser = (token) =>
  api.post('/auth/logout', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
