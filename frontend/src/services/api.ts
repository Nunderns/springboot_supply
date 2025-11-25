import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { authService } from './authService';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If error is not 401 or it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Try to refresh the token
      const newToken = await authService.refreshToken();
      if (newToken) {
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // Retry the original request
        return api(originalRequest);
      }
    } catch (refreshError) {
      // If refresh fails, redirect to login
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }

    return Promise.reject(error);
  }
);
