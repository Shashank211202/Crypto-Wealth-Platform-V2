import api from './api';

export const platformSettingsService = {
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data; // Expecting { success: true, data: { ... } }
    } catch (error) {
      console.error('Failed to fetch platform settings', error);
      throw error.response?.data?.message || 'Failed to fetch settings';
    }
  }
};
