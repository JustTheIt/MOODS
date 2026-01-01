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
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user) {
            // Push notification setup (runs only on real device)
            notificationService.registerForPushNotificationsAsync()
                .then(token => {
                    if (token) {
                        console.log('Push token successfully registered and saved');
                    }
                })
                .catch(err => {
                    console.warn('Push registration flow failed:', err);
                });

            fetchNotifications();

            // Setup listeners with safety guards for Expo Go SDK 53+
            try {
                // 1. Listen for notifications received while app is foreground
                notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                    fetchNotifications();
                });

                // 2. Listen for user tapping a notification
                responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                    const data = response.notification.request.content.data;
                    console.log('Notification Tapped:', data);

                    // Handle deep linking based on data structure
                    if (data?.postId) {
                        router.push(`/post/${data.postId}` as any);
                    } else if (data?.userId) {
                        router.push(`/profile/${data.userId}` as any);
                    } else if (typeof data?.url === 'string') {
                        router.push(data.url as any);
                    } else {
                        router.push('/notifications' as any);
                    }
                });
            } catch (error) {
                console.warn('Error setting up notification listeners:', error);
            }

            return () => {
                notificationListener.current?.remove();
                responseListener.current?.remove();
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
