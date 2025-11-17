import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://be-second-hand-ev-platform.onrender.com/api'; // fallback mặc định

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Lấy accessToken thay vì token
    const token = await AsyncStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Xóa accessToken và refreshToken khi unauthorized
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
