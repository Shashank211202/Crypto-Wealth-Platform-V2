import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  addSavedWallet: async (walletData) => {
      const response = await api.post('/users/wallets', walletData);
      return response.data; // Expecting { success: true, savedWallets: [...] }
  },

  removeSavedWallet: async (walletId) => {
      const response = await api.delete(`/users/wallets/${walletId}`);
      return response.data; // Expecting { success: true, savedWallets: [...] }
  }
};
