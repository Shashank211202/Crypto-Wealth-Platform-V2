import api from './api';

export const walletService = {
  // --- USER API ---
  async getMyWallet() {
    try {
      const response = await api.get('/wallet/me');
      return response.data; // { balances: { USDT_TRC20: "95" }, locked: false }
    } catch (error) {
      console.error('Failed to fetch wallet', error);
      throw error;
    }
  },

  // 1.2 Admin: Get User Wallet
  async getAdminUserWallet(userId) {
      try {
          const response = await api.get(`/wallet/${userId}`);
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to fetch user wallet';
      }
  },

  // --- ADMIN API ---
  // 2.1 Create Admin Wallet
  async createAdminWallet(walletData) {
    try {
      // walletData: { coin: "USDT", network: "TRC20", address: "..." }
      const response = await api.post('/admin/wallets', walletData);
      return response.data;
    } catch (error) {
       throw error.response?.data?.message || 'Failed to create admin wallet';
    }
  },

  // 2.2 Get All Admin Wallets
  async getAdminWallets() {
    try {
      const response = await api.get('/admin/wallets');
      return response.data; 
    } catch (error) {
      console.error('Failed to fetch admin wallets', error);
      return [];
    }
  },
  
  // Update/Delete if needed later based on adminWallet.routes.js
  async updateAdminWallet(id, data) {
      const response = await api.put(`/admin/wallets/${id}`, data);
      return response.data;
  },

  async deleteAdminWallet(id) {
      const response = await api.delete(`/admin/wallets/${id}`);
      return response.data;
  }
};
