import api from './api';

export const withdrawalService = {
  // 1. Create Withdrawal Request (User)
  async createWithdrawal(amount, currency, network, address, otp = null) {
      try {
          const response = await api.post('/withdrawals', {
              amount,
              asset: currency,
              network,
              destinationAddress: address,
              otp
          });
          return response.data;
      } catch (error) {
          throw error.response?.data || { message: 'Failed to submit withdrawal' };
      }
  },

  async requestOtp() {
      try {
          const response = await api.post('/withdrawals/request-otp');
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to request OTP';
      }
  },

  async getMyWithdrawals() {
      try {
          const response = await api.get('/withdrawals/me');
          return response.data;
      } catch (error) {
          console.error("Failed to fetch withdrawals", error);
          return [];
      }
  },

  // 3. Get All Withdrawals (Admin)
  // 3. Get All Withdrawals (Admin)
  async getAllWithdrawals() {
      try {
          const response = await api.get('/admin-withdrawals/withdrawals');
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to fetch withdrawals';
      }
  },

  // 4. Approve Withdrawal (Admin)
  // 4. Approve Withdrawal (Admin)
  async approveWithdrawal(id) {
      try {
          // Backend route: POST /api/admin-withdrawals/withdrawals/:id/approve
          const response = await api.post(`/admin-withdrawals/withdrawals/${id}/approve`);
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to approve withdrawal';
      }
  },

  // 4.1 Confirm Withdrawal (Admin)
  async confirmWithdrawal(id, txHash, proofFile) {
      try {
          const formData = new FormData();
          if (txHash) formData.append('txHash', txHash);
          if (proofFile) formData.append('proof', proofFile);

          const response = await api.post(`/admin-withdrawals/withdrawals/${id}/confirm`, formData, {
              headers: {
                  'Content-Type': 'multipart/form-data'
              }
          });
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to confirm withdrawal';
      }
  },

  // 5. Reject Withdrawal (Admin)
  // 5. Reject Withdrawal (Admin)
  async rejectWithdrawal(id, reason) {
      try {
          // Backend route: POST /api/admin-withdrawals/withdrawals/:id/reject
          const response = await api.post(`/admin-withdrawals/withdrawals/${id}/reject`, { reason });
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to reject withdrawal';
      }
  },

  // 6. Create Manual Withdrawal (Admin)
  async createManualWithdrawal(withdrawalData) {
      try {
          const response = await api.post('/admin-withdrawals/manual', withdrawalData);
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to create manual withdrawal';
      }
  }
};
