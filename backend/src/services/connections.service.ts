import { db } from '@/config/firebase';
import admin from 'firebase-admin';

export class ConnectionService {
    static async connectUsers(userId: string, targetUserId: string, mood: string) {
        const connection = {
            userA: userId,
            userB: targetUserId,
            sharedMood: mood,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('connections').add(connection);
        return { id: docRef.id, ...connection };
    }

    static async getConnections(userId: string) {
        const snapshot = await db.collection('connections')
            .where('userA', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async findKindredSpirits(userId: string, currentMood: string) {
        const snapshot = await db.collection('posts')
            .where('mood', '==', currentMood)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const uniqueUsers = new Set<string>();
        const results: { userId: string }[] = [];

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.userId !== userId && !uniqueUsers.has(data.userId)) {
                uniqueUsers.add(data.userId);
                results.push({ userId: data.userId });
            }
        });

        return results.slice(0, 5);
    }
}
