import axios from 'axios';
import { API_BASE_URL } from './api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized! Token expired or invalid.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('sgroup_auth');
    }
    return Promise.reject(error);
  }
);
