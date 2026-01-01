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
                notificationSettings: {
                    likes: true,
                    comments: true,
                    reminders: true
                }
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

    static async savePushToken(userId: string, token: string) {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            pushTokens: admin.firestore.FieldValue.arrayUnion(token)
        });
    }

    static async removePushToken(userId: string, token: string) {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            pushTokens: admin.firestore.FieldValue.arrayRemove(token)
        });
    }

    static async getSuggestedUsers(currentUserId?: string, limit: number = 15) {
        try {
            // Get current user's profile to understand their mood preferences
            let currentUserProfile: any = null;
            let followingIds: string[] = [];

            if (currentUserId) {
                currentUserProfile = await this.getUserProfile(currentUserId);

                // Get list of users already following
                const followingSnapshot = await db.collection('users')
                    .doc(currentUserId)
                    .collection('following')
                    .get();
                followingIds = followingSnapshot.docs.map(doc => doc.id);
            }

            // Fetch active users (users with recent mood activity)
            const usersSnapshot = await db.collection('users')
                .limit(100) // Get pool of candidates
                .get();

            const candidateUsers = await Promise.all(
                usersSnapshot.docs
                    .filter(doc => doc.id !== currentUserId) // Exclude self
                    .filter(doc => !followingIds.includes(doc.id)) // Exclude already following
                    .map(async (doc) => {
                        const userData = doc.data();

                        // Get user's recent mood activity
                        const recentMoods = await db.collection('moods')
                            .where('userId', '==', doc.id)
                            .get();

                        // Sort and limit in-memory to avoid index requirement
                        const moodData = recentMoods.docs
                            .map(m => m.data())
                            .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))
                            .slice(0, 5);

                        // Calculate priority score
                        let priorityScore = 0;

                        // 1. Shared mood match (weight: 3.0)
                        if (currentUserProfile?.dominantMood && userData.dominantMood) {
                            if (currentUserProfile.dominantMood === userData.dominantMood) {
                                priorityScore += 3.0;
                            }
                        }

                        // 2. Mood intensity similarity (weight: 2.0)
                        if (moodData.length > 0 && currentUserProfile) {
                            const avgIntensity = moodData.reduce((sum, m) => sum + (m.intensity || 0.5), 0) / moodData.length;
                            const currentUserIntensity = 0.5; // Default if not available
                            const intensitySimilarity = 1 - Math.abs(avgIntensity - currentUserIntensity);
                            priorityScore += intensitySimilarity * 2.0;
                        }

                        // 3. Recent activity (weight: 1.5)
                        const recentActivityBoost = moodData.length > 0 ? 1.5 : 0;
                        priorityScore += recentActivityBoost;

                        // 4. Mutual interactions (weight: 2.5)
                        // Check if this user has liked/commented on current user's posts
                        if (currentUserId) {
                            const interactionsSnapshot = await db.collection('posts')
                                .where('userId', '==', currentUserId)
                                .limit(10)
                                .get();

                            let mutualInteractions = 0;
                            for (const postDoc of interactionsSnapshot.docs) {
                                const likeDoc = await db.collection('posts')
                                    .doc(postDoc.id)
                                    .collection('likes')
                                    .doc(doc.id)
                                    .get();
                                if (likeDoc.exists) mutualInteractions++;
                            }
                            priorityScore += mutualInteractions * 2.5;
                        }

                        // Add randomness for diversity (0-0.5)
                        priorityScore += Math.random() * 0.5;

                        return {
                            id: doc.id,
                            ...userData,
                            priorityScore,
                            sharedMoods: currentUserProfile?.dominantMood === userData.dominantMood
                                ? [userData.dominantMood]
                                : [],
                            isFollowing: false,
                            createdAt: userData.createdAt ? (userData.createdAt as admin.firestore.Timestamp).toMillis() : null
                        };
                    })
            );

            // Sort by priority score (descending) and limit
            const suggestedUsers = candidateUsers
                .sort((a, b) => b.priorityScore - a.priorityScore)
                .slice(0, limit);

            return suggestedUsers;
        } catch (error) {
            console.error('Error getting suggested users:', error);
            return [];
        }
    }
}
