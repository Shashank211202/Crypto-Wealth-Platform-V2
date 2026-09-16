import { EventEmitter } from '../utils/EventEmitter';
import api from './api';

export const authEvents = new EventEmitter();

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      let { accessToken, user } = response.data;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        
        // Fetch full profile to get role and other details not in initial login response
        try {
            const profileRes = await api.get('/auth/profile');
            if (profileRes.data && profileRes.data.user) {
                user = { ...user, ...profileRes.data.user };
            }
        } catch (e) {
            console.warn('Failed to fetch profile after login', e);
        }

        localStorage.setItem('user', JSON.stringify(user));
        authEvents.emit('login', user);
      }
      return user;
    } catch (error) {
      if (error.response && error.response.data) {
          throw error.response.data; // Throw full error object (contains message, requiresOtp, email)
      }
      throw { message: 'Login failed' };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  async registerAdmin(userData) {
    try {
      const response = await api.post('/auth/gulugulugulu/randibazz', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Admin registration failed';
    }
  },

  async verifyOtp(email, otp) {
    try {
        const response = await api.post('/auth/verify-otp', { email, otp });
        // Handle auto-login on success
        let { accessToken, user } = response.data;
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            authEvents.emit('login', user);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Verification failed';
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      authEvents.emit('logout');
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') return null;
    try {
      return JSON.parse(user);
    } catch (e) {
      console.error('Error parsing user from local storage', e);
      localStorage.removeItem('user');
      return null;
    }
  },

  async checkAuth() {
    try {
      const user = this.getCurrentUser();
      // Verify token validity with backend
      const response = await api.get('/auth/profile');
      // Update user data if needed
      const validUser = response.data.user;
      
      // Always sync local storage with latest backend data
      localStorage.setItem('user', JSON.stringify({ ...user, ...validUser }));
      
      authEvents.emit('login', validUser);
      return validUser;
    } catch (error) {
      // If profile check fails (401), logout is handled by interceptor
      return null;
    }
  },

  async updateProfile(data) {
    try {
        const response = await api.put('/users/profile', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Profile update failed';
    }
  },

  async changePassword(currentPassword, newPassword) {
      try {
          const response = await api.put('/users/password', { currentPassword, newPassword });
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Password update failed';
      }
  },

  async forgotPassword(email) {
      try {
          const response = await api.post('/auth/forgot-password', { email });
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to send reset code';
      }
  },

  async resetPassword(email, otp, newPassword) {
      try {
          const response = await api.post('/auth/reset-password', { email, otp, newPassword });
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Password reset failed';
      }
  }
};
