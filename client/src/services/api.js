import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resonate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on protected calls (and not already on login/register)
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // Optionally redirect or clear storage
        localStorage.removeItem('resonate_token');
        localStorage.removeItem('resonate_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
