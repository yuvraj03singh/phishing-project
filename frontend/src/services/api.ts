import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('phishguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept errors and format user friendly responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional auto logout or token wipe
    }
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.detail?.message ||
      error.response?.data?.detail ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;
