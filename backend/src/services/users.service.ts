import { db } from '@/config/firebase';
import admin from 'firebase-admin';

export class UserService {
    static async getUserProfile(userId: string) {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const data = userDoc.data() || {};
            return {
                id: userDoc.id,
                ...data,
                createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toMillis() : null
            };
        }
        return null;
    }

    static async isUsernameTaken(username: string): Promise<boolean> {
        const normalized = username.toLowerCase().trim();
        const snapshot = await db.collection('users')
            .where('username', '==', normalized)
            .limit(1)
            .get();
        return !snapshot.empty;
    }

    static async isEmailTaken(email: string): Promise<boolean> {
        const normalized = email.toLowerCase().trim();
        const snapshot = await db.collection('users')
            .where('email', '==', normalized)
            .limit(1)
            .get();
        return !snapshot.empty;
    }

    static generateUsernameSuggestions(baseUsername: string): string[] {
        const normalized = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const suggestions: string[] = [];

        const currentYear = new Date().getFullYear();

        // Suggestion 1: Add random 2-digit number
        const randomNum = Math.floor(Math.random() * 90) + 10;
        suggestions.push(`${normalized}_${randomNum}`);

        // Suggestion 2: Add current year
        suggestions.push(`${normalized}_${currentYear}`);

        // Suggestion 3: Add ".moods" suffix
        suggestions.push(`${normalized}.moods`);

        return suggestions.filter(s => s.length >= 3 && s.length <= 20);
    }

    static async createUserProfile(userId: string, data: any) {
        const userRef = db.collection('users').doc(userId);
        const snapshot = await userRef.get();

        if (!snapshot.exists) {
            const newUser = {
                ...data,
                id: userId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await userRef.set(newUser);
            return newUser;
        }
        return { id: snapshot.id, ...snapshot.data() };
    }

    static async updateUserProfile(userId: string, data: any) {
        const userRef = db.collection('users').doc(userId);
        await userRef.update(data);
        const updated = await userRef.get();
        return { id: updated.id, ...updated.data() };
    }

    static async followUser(userId: string, targetUserId: string) {
        const batch = db.batch();

        const followingRef = db.collection('users').doc(userId).collection('following').doc(targetUserId);
        const followersRef = db.collection('users').doc(targetUserId).collection('followers').doc(userId);

        batch.set(followingRef, { createdAt: admin.firestore.FieldValue.serverTimestamp() });
        batch.set(followersRef, { createdAt: admin.firestore.FieldValue.serverTimestamp() });

        await batch.commit();
    }

    static async unfollowUser(userId: string, targetUserId: string) {
        const batch = db.batch();

        const followingRef = db.collection('users').doc(userId).collection('following').doc(targetUserId);
        const followersRef = db.collection('users').doc(targetUserId).collection('followers').doc(userId);

        batch.delete(followingRef);
        batch.delete(followersRef);

        await batch.commit();
    }
}
