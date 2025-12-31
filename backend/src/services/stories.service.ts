import { db } from '@/config/firebase';
import admin from 'firebase-admin';

export class StoryService {
    static async createStory(userId: string, data: any) {
        const storyRef = db.collection('stories').doc();
        const now = Date.now();
        const expiresAt = now + 24 * 60 * 60 * 1000;

        const newStory = {
            ...data,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromMillis(expiresAt),
        };

        await storyRef.set(newStory);
        return { id: storyRef.id, ...newStory };
    }

    static async getActiveStories() {
        const now = admin.firestore.Timestamp.now();
        const snapshot = await db.collection('stories')
            .where('expiresAt', '>', now)
            .orderBy('expiresAt', 'asc')
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toMillis() : Date.now(),
                expiresAt: data.expiresAt ? data.expiresAt.toMillis() : Date.now() + 86400000,
            };
        });
    }

    static async deleteStory(storyId: string) {
        await db.collection('stories').doc(storyId).delete();
    }

    static async markStoryAsViewed(userId: string, storyId: string) {
        const userViewedRef = db.collection('users').doc(userId).collection('viewedStories').doc(storyId);
        await userViewedRef.set({
            viewedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    static async getViewedStories(userId: string) {
        const snapshot = await db.collection('users').doc(userId).collection('viewedStories').get();
        return snapshot.docs.map(doc => doc.id);
    }
}
