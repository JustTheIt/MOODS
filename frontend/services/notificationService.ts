import api from '@/lib/api';

export interface NotificationItem {
    id: string;
    userId: string;
    type: 'like' | 'comment' | 'follow' | 'mood_reminder' | 'system';
    title: string;
    body: string;
    data?: any;
    isRead: boolean;
    createdAt: Date | string;
}

export const notificationService = {
    async registerForPushNotificationsAsync() {
        // web-safe version: do nothing
        console.log('Push notifications registration skipped on web/SSG environment');
        return null;
    },

    async savePushToken(token: string) {
        // web-safe version: do nothing
    },

    async getNotifications(limit = 20, lastId?: string) {
        try {
            const response = await api.get('/notifications', { params: { limit, lastId } });
            // The backend returns the array directly
            return Array.isArray(response.data) ? response.data : (response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async markAsRead(id: string) {
        try {
            await api.post(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    async markAllAsRead() {
        try {
            await api.post('/notifications/read-all');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
};
