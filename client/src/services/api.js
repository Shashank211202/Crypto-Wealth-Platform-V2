import axios from 'axios';
import { authEvents } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log Request
    // console.log(`%c🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, 'color: #3b82f6; font-weight: bold;', config.data || '');

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log Response
    // console.log(`%c✅ API Response: ${response.status} ${response.config.url}`, 'color: #10b981; font-weight: bold;', response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log Error Response
    if (error.response) {
        console.error(`%c❌ API Error: ${error.response.status} ${originalRequest?.url}`, 'color: #ef4444; font-weight: bold;', error.response.data);
    } else {
        console.error('❌ API Network Error:', error.message);
    }
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('🔄 Attempting token refresh...');
        const storedAccessToken = localStorage.getItem('accessToken');
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: storedAccessToken ? { Authorization: `Bearer ${storedAccessToken}` } : undefined
          }
        );
        const { accessToken } = response.data;
        
        if (accessToken) {
            console.log('✅ Token refresh successful');
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
        }
      } catch (refreshError) {
        if (refreshError.response && refreshError.response.data) {
            console.error('❌ Token refresh failed:', refreshError.response.data.message || refreshError.response.status);
        } else {
            console.error('❌ Token refresh failed - Logging out');
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        authEvents.emit('logout');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
