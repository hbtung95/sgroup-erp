import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - inject auth token
api.interceptors.request.use((config) => {
  // For simulation purposes, using mock token
  // In production, this would read from localStorage/cookie
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") || "mock-admin-token" : "mock-admin-token";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - standardize error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || "Lỗi kết nối server";
    return Promise.reject(new Error(message));
  }
);

export default api;
