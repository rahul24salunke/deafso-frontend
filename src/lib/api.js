import axios from 'axios';
import { getStoredToken, isTokenExpired, clearStoredAuth } from './auth';

const resolvedBaseURL = typeof import.meta.env.VITE_API_BASE_URL === 'string'
  ? import.meta.env.VITE_API_BASE_URL
  : '/';

const api = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true,
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearStoredAuth();
      // Optionally redirect to login
      if (window.location.pathname !== '/student/login' && window.location.pathname !== '/teacher/login') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


