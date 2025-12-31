import { Timestamp } from 'firebase-admin/firestore';
import admin, { db } from '../config/firebase';

export interface NotificationData {
    id?: string;
    userId: string;
    type: 'like' | 'comment' | 'follow' | 'mood_reminder' | 'system';
    title: string;
    body: string;
    data?: any;
    isRead: boolean;
    createdAt: Date | Timestamp;
}

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
    // Create a notification and send push
    async createNotification(
        userId: string,
        type: NotificationData['type'],
        title: string,
        body: string,
        data: any = {}
    ) {
        try {
            // 1. Save to Firestore
            const newNotification: Omit<NotificationData, 'id'> = {
                userId,
                type,
                title,
                body,
                data,
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp() as Timestamp
            };

            const docRef = await db.collection(NOTIFICATIONS_COLLECTION).add(newNotification);

            // 2. Send Push Notification via FCM
            // Note: In a real app, you'd fetch the user's FCM tokens from a 'users' collection
            const userDoc = await db.collection('users').doc(userId).get();
            const fcmToken = userDoc.data()?.fcmToken;

            if (fcmToken) {
                await admin.messaging().send({
                    token: fcmToken,
                    notification: {
                        title,
                        body,
                    },
                    data: {
                        ...data,
                        url: data.url || '/notifications', // Deep link fallback
                        notificationId: docRef.id
                    }
                });
                console.log(`Push sent to ${userId}`);
            }

            return { id: docRef.id, ...newNotification };

        } catch (error) {
            console.error('Error creating notification:', error);
            // We don't throw here to avoid failing the main action (e.g. liking a post)
            // just because the notification failed.
            return null;
        }
    },

    // Get notifications for a user (paginated)
    async getUserNotifications(userId: string, limit: number = 20, lastId?: string) {
        let query = db.collection(NOTIFICATIONS_COLLECTION)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(limit);

        if (lastId) {
            const lastDoc = await db.collection(NOTIFICATIONS_COLLECTION).doc(lastId).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore Timestamp to Date for frontend
            createdAt: (doc.data().createdAt as Timestamp)?.toDate?.() || doc.data().createdAt
        }));
    },

    // Mark as read
    async markAsRead(notificationId: string) {
        await db.collection(NOTIFICATIONS_COLLECTION).doc(notificationId).update({
            isRead: true
        });
    },

    // Mark all as read
    async markAllAsRead(userId: string) {
        const batch = db.batch();
        const snapshot = await db.collection(NOTIFICATIONS_COLLECTION)
            .where('userId', '==', userId)
            .where('isRead', '==', false)
            .get();

        if (snapshot.empty) return;

        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });

        await batch.commit();
    }
};
