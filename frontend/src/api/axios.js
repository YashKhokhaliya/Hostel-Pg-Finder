import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to automatically handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/users/login') &&
      !originalRequest.url.includes('/users/refresh-tokens')
    ) {
      originalRequest._retry = true;
      try {
        await api.post('/users/refresh-tokens');
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - session expired
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
