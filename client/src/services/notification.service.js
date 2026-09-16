import api from './api';

export const notificationService = {
    async getNotifications() {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async createBroadcast(title, message) {
        try {
            const response = await api.post('/notifications/broadcast', { title, message });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to send broadcast';
        }
    },

    async markAsRead(id) {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            throw error; // Silent fail often ok here
        }
    },

    async markAllAsRead() {
        try {
            const response = await api.put('/notifications/read-all');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // Recent Activity for Admin Dashboard
    async getRecentActivity(limit = 8) {
        try {
            const response = await api.get(`/notifications/recent-activity?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch activity", error);
            return [];
        }
    }
};
