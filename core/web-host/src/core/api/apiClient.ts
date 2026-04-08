import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';
import { useAuthStore } from '../../features/auth/store/authStore';


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Primary: read token from Zustand store (set on login)
      let token = useAuthStore.getState().token;
      // Fallback: read from AsyncStorage (for persistence across reloads)
      if (!token) {
        token = await AsyncStorage.getItem('access_token');
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized! Token expired or invalid.');
      await AsyncStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);
