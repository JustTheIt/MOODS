import { db } from '@/config/firebase';
import admin from 'firebase-admin';

export class MoodService {
    static async logMood(userId: string, moodData: any) {
        const moodRef = db.collection('moods').doc();
        const log = {
            ...moodData,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await moodRef.set(log);
        return { id: moodRef.id, ...log };
    }

    static async getMoodHistory(userId: string) {
        const snapshot = await db.collection('moods')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.createdAt ? data.createdAt.toMillis() : Date.now(),
            };
        });
    }

    static async deleteMood(moodId: string) {
        await db.collection('moods').doc(moodId).delete();
    }
}
