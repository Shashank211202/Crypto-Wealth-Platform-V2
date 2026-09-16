
import api from './api';

export const ledgerService = {
  getMyTransactions: async (params) => {
    try {
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch transactions';
    }
  }
};
