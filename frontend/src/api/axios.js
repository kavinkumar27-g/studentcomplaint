/**
 * axios.js - Configured Axios HTTP Client
 * 
 * This creates a pre-configured Axios instance that:
 * 1. Points to the Spring Boot backend (localhost:8080)
 * 2. Automatically attaches the JWT token to every request
 * 3. Handles 401 errors by redirecting to login
 */

import axios from 'axios';

// Create Axios instance with base configuration
const api = axios.create({
  // Use relative path so Vite proxy handles it
  baseURL: '',
});

/**
 * REQUEST INTERCEPTOR
 * Runs before every HTTP request.
 * Automatically adds "Authorization: Bearer <token>" header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR  
 * Runs after receiving every HTTP response.
 * If we get a 401 (Unauthorized), the token expired → redirect to login.
 */
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired session and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
