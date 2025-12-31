import { NotificationItem, notificationService } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const { user } = useAuth();
    const router = useRouter();
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            // Mock data for now until backend connection is live in service
            // const data = await notificationService.getNotifications();
            // setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user) {
            // Push notification setup
            notificationService.registerForPushNotificationsAsync().then(token => {
                if (token) {
                    console.log('Push token generated successfully');
                    // Here you would save the token to your backend for this user
                    // userService.savePushToken(user.uid, token);
                }
            }).catch(err => {
                console.warn('Push registration failed:', err);
            });

            fetchNotifications();

            // Only setup listeners if push notifications are likely to work or if we want local notifications
            // On SDK 53 Expo Go, even adding listeners might trigger warnings or issues
            try {
                // 1. Listen for notifications received while app is foreground
                notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                    // Refresh list to show new notification
                    fetchNotifications();
                });

                // 2. Listen for user tapping a notification
                responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                    const data = response.notification.request.content.data;
                    // Handle deep linking based on data
                    if (data?.postId) {
                        router.push(`/post/${data.postId}`);
                    } else if (typeof data?.url === 'string') {
                        router.push(data.url as any);
                    } else {
                        router.push('/notifications');
                    }
                });
            } catch (error) {
                console.warn('Failed to set up notification listeners:', error);
            }

            return () => {
                try {
                    notificationListener.current?.remove();
                    responseListener.current?.remove();
                } catch (e) {
                    console.warn('Error cleanup notification subscriptions:', e);
                }
            };
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            refreshNotifications: fetchNotifications,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
}
