import { NotificationItem, notificationService } from '@/services/notificationService';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

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
            fetchNotifications();
            console.log('Notification listeners skipped on web/SSG environment');
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
