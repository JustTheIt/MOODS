import { db } from '@/config/firebase';
import admin from 'firebase-admin';

export class MoodService {
    static async logMood(userId: string, moodData: any) {
        const moodRef = db.collection('moods').doc();
        const now = Date.now();
        const log = {
            ...moodData,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await moodRef.set(log);

        // Feedback Loop: Log corrections to improve sentiment model
        if (moodData.suggestedMood && moodData.mood && moodData.suggestedMood !== moodData.mood) {
            await db.collection('sentiment_feedback').add({
                text: moodData.text,
                label: moodData.mood, // The correct label provided by the user
                originalSuggestion: moodData.suggestedMood,
                userId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        return { id: moodRef.id, ...log, timestamp: now };
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
