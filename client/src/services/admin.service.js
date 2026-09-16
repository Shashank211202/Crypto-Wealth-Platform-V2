import api from './api';
import { depositService } from './deposit.service';

export const adminService = {
    // Deposits
    async getDeposits() {
        return depositService.getAllDeposits();
    },

    async updateDepositStatus(id, newStatus) {
        // This is a generic handler, but ideally we should use approve/reject directly.
        // If legacy code calls this, we map it. 
        // Note: 'Approved' and 'Rejected' are the likely status strings.
        if (newStatus === 'Approved') {
             return depositService.approveDeposit(id, 0); // Amount 0 if not specified
        } else if (newStatus === 'Rejected') {
             return depositService.rejectDeposit(id, 'Status updated via admin');
        }
        return true;
    },

    // Tickets
    async getTickets() {
        try {
            const response = await api.get('/admin-ticket/tickets');
            // Backend already formats the data, but we map it here to ensure consistency
            return response.data.map(t => ({
                id: t.id,
                subject: t.subject,
                user: t.user || 'Unknown User',
                email: t.email || 'No Email',
                status: t.status,
                date: t.date,
                messages: t.messages || [] // Map the full messages array
            }));
        } catch (error) {
            console.error('Failed to get tickets', error);
            return [];
        }
    },

    async closeTicket(id) {
         try {
            // Send uppercase CLOSED to match Mongoose enum
            return await this.replyTicket(id, 'Ticket closed by admin', 'CLOSED');
        } catch (error) {
             throw error;
        }
    },
    
    async replyTicket(id, replyMessage, status = 'IN_PROGRESS') {
        try {
            const response = await api.post(`/admin-ticket/tickets/${id}/reply`, {
                message: replyMessage,
                status: status // Expected: OPEN, IN_PROGRESS, RESOLVED, CLOSED
            });
            return response.data;
        } catch (error) {
             throw error.response?.data?.message || 'Failed to reply';
        }
    },

    // Users
    async getUsers(search = '') {
        try {
            const params = search ? { search } : {};
            const response = await api.get('/admin/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch users';
        }
    },

    async getUserDetails(userId) {
        try {
            const response = await api.get(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch user details';
        }
    },

    // Plans
    async createPlan(planData) {
        try {
            // planData: { name, description, billingCycle, charges, profitPercentage }
            const response = await api.post('/admin/plans', planData);
            return response.data;
        } catch (error) {
             throw error.response?.data?.message || 'Failed to create plan';
        }
    },
    
    async getPlans() {
        try {
            const response = await api.get('/admin/plans');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch plans';
        }
    },

    async updatePlan(id, planData) {
        try {
            const response = await api.put(`/admin/plans/${id}`, planData);
             return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update plan';
        }
    },

    async disablePlan(id) {
        try {
            const response = await api.patch(`/admin/plans/${id}/disable`);
             return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to disable plan';
        }
    },
    
    // Wallet Actions
    async freezeWallet(userId) {
        try {
            const response = await api.post(`/admin/wallet/${userId}/freeze`);
            return response.data;
        } catch (error) {
             throw error.response?.data?.message || 'Failed to freeze wallet';
        }
    },

    async unfreezeWallet(userId) {
        try {
            const response = await api.post(`/admin/wallet/${userId}/unfreeze`);
            return response.data;
        } catch (error) {
             throw error.response?.data?.message || 'Failed to unfreeze wallet';
        }
    },

    async updateInvestment(investmentId, data) {
        try {
            const response = await api.put(`/admin/investments/${investmentId}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update investment';
        }
    },

    async updateUserBalance(userId, balances) {
        try {
            const response = await api.put(`/admin/wallet/${userId}/balance`, balances);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update balance';
        }
    },

    // Generic Update/Delete (Not Documented)
    async updateUser(user) {
        try {
            const response = await api.put(`/admin/users/${user.id}`, {
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                level: user.level,
                points: user.points,
                telegramUsername: user.telegramUsername,
                password: user.password // Only included if set in frontend
            });
            return response.data;
        } catch (error) {
             throw error.response?.data?.message || 'Failed to update user';
        }
    },

    async deleteUser(userId) {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
             throw error.response?.data?.message || 'Failed to delete user';
        }
    },

    async bulkDeleteUsers(userIds) {
        try {
            const response = await api.delete('/admin/users/bulk', { data: { userIds } });
            return response.data;
        } catch (error) {
             throw error.response?.data?.message || 'Failed to delete users';
        }
    },

    // Settings
    async getSettings() {
        try {
            const response = await api.get('/settings');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch settings';
        }
    },

    async triggerProfitDistribution() {
        try {
            // Note: This matches the route /api/investments/process-profits
            const response = await api.get('/investments/process-profits');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to trigger profit distribution';
        }
    },

    async updateSettings(settingsData) {
        try {
            const response = await api.put('/settings', settingsData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update settings';
        }
    },

    // Dashboard Stats
    async getDashboardStats() {
        try {
            const response = await api.get('/admin/stats');
            return response.data; // { stats: {...}, chartData: [...] }
        } catch (error) {
            console.error('Failed to get dashboard stats', error);
            throw error;
        }
    },

    // Investments
    async getAllInvestments(userId = null) {
        try {
            const params = userId ? { userId } : {};
            const response = await api.get('/admin/investments', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch investments';
        }
    },

    async updateInvestment(id, data) {
        try {
            const response = await api.put(`/admin/investments/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update investment';
        }
    },
};
