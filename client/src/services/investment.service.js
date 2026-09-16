
import api from './api';

export const investmentService = {
  getMyInvestments: async () => {
    try {
      const response = await api.get('/investments');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch investments';
    }
  }
};
