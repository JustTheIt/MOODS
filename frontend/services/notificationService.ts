import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

// Configure axios instance - replacing with your actual backend URL or using env
// For now assuming a global or imported api client, but defining simple one here
const API_URL = 'http://localhost:3000/api'; // Update this for real device!

const getHeaders = async () => {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    return {
        Authorization: `Bearer ${token}`
    };
};

export interface NotificationItem {
    id: string;
    userId: string;
    type: 'like' | 'comment' | 'follow' | 'mood_reminder' | 'system';
    title: string;
    body: string;
    data?: any;
    isRead: boolean;
    createdAt: Date | string; // Date string from backend
}

export const notificationService = {
    async registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
            console.warn('Push notifications are not supported in Expo Go on Android (SDK 53+). Please use a development build for full functionality.');
            return;
        }

        if (Device.isDevice) {
            try {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    console.log('Failed to get push token for push notification!');
                    return;
                }

                // Project ID is usually needed for Expo Push Notifications
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                })).data;

                // In a real app, you would send this token to your backend here
                // await axios.post(`${API_URL}/users/push-token`, { token }, { headers: await getHeaders() });
                console.log("Expo Push Token:", token);
            } catch (error) {
                console.warn('Error fetching push token:', error);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    },

    async getNotifications(limit = 20, lastId?: string) {
        // Replace with your actual api client
        // const response = await api.get('/notifications', { params: { limit, lastId }});
        // return response.data;

        // Mocking for now as we haven't connected fully to backend URL in this file
        // You should import your 'api' client from '@/services/api' or similar
        return [];
    },

    async markAsRead(id: string) {
        // await api.post(`/notifications/${id}/read`);
    },

    async markAllAsRead() {
        // await api.post(`/notifications/read-all`);
    }
};
