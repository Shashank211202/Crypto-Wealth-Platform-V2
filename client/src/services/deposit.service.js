import api from './api';

export const depositService = {
  // --- USER API ---

  // 4.1 Get Deposit Options (Admin Wallets)
  async getDepositOptions() {
    try {
      const response = await api.get('/deposits/options');
      return response.data; // Array of admin wallets
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch deposit options';
    }
  },

  // 4.2 Create Deposit
  async createDeposit(formData) {
    try {
      // formData should be instance of FormData
      const response = await api.post('/deposits', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Deposit submission failed';
    }
  },

  // 4.3 Get My Deposits
  async getMyDeposits() {
    try {
      const response = await api.get('/deposits/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch deposits';
    }
  },

  // --- ADMIN API ---

  // 5.0 Get All Deposits (Admin)
  async getAllDeposits() {
      try {
          const response = await api.get('/deposits');
          return response.data;
      } catch (error) {
          console.error("Failed to fetch admin deposits", error);
           return [];
      }
  },

  // 5.1 Approve Deposit
  async approveDeposit(depositId, approvedAmount) {
    try {
      const response = await api.post(`/deposits/${depositId}/approve`, { approvedAmount });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to approve deposit';
    }
  },

  // 5.2 Reject Deposit
  async rejectDeposit(depositId, remarks) {
    try {
      const response = await api.post(`/deposits/${depositId}/reject`, { remarks });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to reject deposit';
    }
  }
};
