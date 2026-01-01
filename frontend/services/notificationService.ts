import api from '@/lib/api';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return null;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        try {
            // Get Expo Push Token
            // We need a projectId to get the push token.
            const projectId = (Constants.expoConfig as any)?.extra?.eas?.projectId || (Constants.expoConfig as any)?.projectId;

            if (!projectId) {
                console.error('Push Notifications Error: No "projectId" found in app.json. Please run "npx eas project:init" or set it manually in app.json under extra.eas.projectId.');
                return null;
            }

            const tokenResponse = await Notifications.getExpoPushTokenAsync({
                projectId,
            });

            const token = tokenResponse.data;
            console.log("Expo Push Token:", token);

            // Save to backend
            await this.savePushToken(token);

            return token;
        } catch (error) {
            console.error('Error fetching push token:', error);
            return null;
        }
    },

    async savePushToken(token: string) {
        try {
            await api.post('/users/me/push-token', { token });
        } catch (error) {
            console.error('Error saving push token to backend:', error);
        }
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
            await api.patch(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    async markAllAsRead() {
        try {
            await api.patch('/notifications/read-all');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
};
