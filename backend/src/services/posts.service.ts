import { db } from '@/config/firebase';
import admin from 'firebase-admin';

import { notificationService } from '@/services/notificationService';

export class PostService {
    static async createPost(postData: any) {
        const postRef = db.collection('posts').doc();
        const newPost = {
            ...postData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            likesCount: 0,
            commentsCount: 0,
            repostsCount: 0,
        };

        await postRef.set(newPost);
        return {
            id: postRef.id,
            ...newPost,
            timestamp: Date.now() // Return current time as Millis for immediate UI update
        };
    }

    static async getFeed(limitNum: number = 20, lastDoc?: string, moodFilter?: string, userIdFilter?: string, currentUserId?: string) {
        let query = db.collection('posts').orderBy('createdAt', 'desc').limit(limitNum);

        if (moodFilter) {
            query = query.where('mood', '==', moodFilter);
        }

        if (userIdFilter) {
            query = query.where('userId', '==', userIdFilter);
        }

        if (lastDoc) {
            const docSnapshot = await db.collection('posts').doc(lastDoc).get();
            if (docSnapshot.exists) {
                query = query.startAfter(docSnapshot);
            }
        }

        const snapshot = await query.get();
        const posts = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const postId = doc.id;

            let isLiked = false;
            if (currentUserId) {
                const likeDoc = await db.collection('posts').doc(postId).collection('likes').doc(currentUserId).get();
                isLiked = likeDoc.exists;
            }

            const post: any = {
                id: postId,
                ...data,
                timestamp: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toMillis() : Date.now(),
                isLiked
            };

            // Enrich Repost Data
            if (data.originalPostId) {
                try {
                    const originalPostDoc = await db.collection('posts').doc(data.originalPostId).get();
                    if (originalPostDoc.exists) {
                        const originalData = originalPostDoc.data();
                        post.originalPost = {
                            id: originalPostDoc.id,
                            ...originalData,
                            timestamp: originalData?.createdAt ? (originalData.createdAt as admin.firestore.Timestamp).toMillis() : Date.now(),
                        };

                        // Fetch original author
                        const authorDoc = await db.collection('users').doc(originalData?.userId).get();
                        if (authorDoc.exists) {
                            const authorData = authorDoc.data();
                            post.originalAuthor = {
                                id: authorDoc.id,
                                ...authorData,
                                username: authorData?.username,
                                avatarUrl: authorData?.avatarUrl || authorData?.avatar,
                            };
                        }
                    }
                } catch (err) {
                    console.error('Error enriching repost:', err);
                }
            }

            return post;
        }));

        return {
            posts,
            lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
        };
    }

    static async toggleLike(postId: string, userId: string) {
        const postRef = db.collection('posts').doc(postId);
        const likeRef = postRef.collection('likes').doc(userId);
        let shouldNotify = false;
        let postAuthorId: string | undefined;

        await db.runTransaction(async (transaction) => {
            const [likeDoc, postDoc] = await Promise.all([
                transaction.get(likeRef),
                transaction.get(postRef)
            ]);

            if (!postDoc.exists) {
                throw new Error('Post not found');
            }

            postAuthorId = postDoc.data()?.userId;

            if (likeDoc.exists) {
                transaction.delete(likeRef);
                transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(-1) });
            } else {
                transaction.set(likeRef, { userId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
                transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(1) });

                if (postAuthorId && postAuthorId !== userId) {
                    shouldNotify = true;
                }
            }
        });

        if (shouldNotify && postAuthorId) {
            notificationService.createNotification(
                postAuthorId,
                'like',
                'New Like',
                'Someone liked your mood.',
                { postId, userId }
            ).catch(err => console.error('Notification error:', err));
        }
    }

    static async addComment(postId: string, userId: string, content: string) {
        const postRef = db.collection('posts').doc(postId);
        const commentRef = postRef.collection('comments').doc();

        const commentData = {
            userId,
            content,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.runTransaction(async (transaction) => {
            transaction.set(commentRef, commentData);
            transaction.update(postRef, { commentsCount: admin.firestore.FieldValue.increment(1) });
        });

        // Trigger Notification (After transaction)
        const postDoc = await postRef.get();
        const postAuthorId = postDoc.data()?.userId;

        if (postAuthorId && postAuthorId !== userId) {
            notificationService.createNotification(
                postAuthorId,
                'comment',
                'New Comment',
                `Someone commented: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
                { postId, userId, commentId: commentRef.id }
            ).catch(console.error);
        }

        return { id: commentRef.id, ...commentData };
    }

    static async deletePost(postId: string) {
        await db.collection('posts').doc(postId).delete();
    }

    static async getComments(postId: string) {
        const snapshot = await db.collection('posts').doc(postId).collection('comments').orderBy('createdAt', 'asc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toMillis() : Date.now(),
            };
        });
    }

    static async getTrendingPosts(limitNum: number = 20, moodFilter?: string, currentUserId?: string) {
        try {
            // Fetch recent posts (last 7 days for trending calculation)
            const sevenDaysAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const snapshot = await db.collection('posts')
                .where('createdAt', '>=', sevenDaysAgo)
                .get();

            // Filter by mood and sort by createdAt desc in-memory to avoid index requirement
            let candidateDocs = snapshot.docs;

            if (moodFilter) {
                candidateDocs = candidateDocs.filter(doc => doc.data().mood === moodFilter);
            }

            candidateDocs = candidateDocs
                .sort((a, b) => {
                    const aTime = a.data().createdAt?.toMillis() || 0;
                    const bTime = b.data().createdAt?.toMillis() || 0;
                    return bTime - aTime;
                })
                .slice(0, 200);

            // Calculate trending scores for each post
            const postsWithScores = await Promise.all(
                candidateDocs.map(async (doc) => {
                    const data = doc.data();
                    const postId = doc.id;
                    const createdAt = data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toMillis() : Date.now();
                    const ageInHours = (Date.now() - createdAt) / (1000 * 60 * 60);

                    // Engagement metrics
                    const likesCount = data.likesCount || 0;
                    const commentsCount = data.commentsCount || 0;
                    const repostsCount = data.repostsCount || 0;
                    const moodIntensity = data.intensity || 0.5;

                    // Calculate trending score
                    // Formula: (likes * 1.5) + (comments * 2) + (reposts * 3) + (intensity * 2) + recencyBoost
                    let trendingScore =
                        (likesCount * 1.5) +
                        (commentsCount * 2.0) +
                        (repostsCount * 3.0) +
                        (moodIntensity * 2.0);

                    // Recency boost (exponential decay)
                    let recencyBoost = 0;
                    if (ageInHours < 1) {
                        recencyBoost = 10;
                    } else if (ageInHours < 6) {
                        recencyBoost = 5;
                    } else if (ageInHours < 24) {
                        recencyBoost = 2;
                    } else if (ageInHours < 48) {
                        recencyBoost = 1;
                    }
                    trendingScore += recencyBoost;

                    // Generate explainable trending reason
                    let trendingReason = "Community resonance";
                    if (recencyBoost >= 10) {
                        trendingReason = "Trending right now";
                    } else if (repostsCount > 5) {
                        trendingReason = "Highly shared vibe";
                    } else if (moodIntensity > 0.8) {
                        trendingReason = "Intense aura";
                    } else if (commentsCount > 3) {
                        trendingReason = "Inspiring conversation";
                    }

                    // Check if current user liked this post
                    let isLiked = false;
                    if (currentUserId) {
                        const likeDoc = await db.collection('posts').doc(postId).collection('likes').doc(currentUserId).get();
                        isLiked = likeDoc.exists;
                    }

                    const post: any = {
                        id: postId,
                        ...data,
                        timestamp: createdAt,
                        trendingScore,
                        trendingReason,
                        isLiked
                    };

                    // Enrich Repost Data
                    if (data.originalPostId) {
                        try {
                            const originalPostDoc = await db.collection('posts').doc(data.originalPostId).get();
                            if (originalPostDoc.exists) {
                                const originalData = originalPostDoc.data();
                                post.originalPost = {
                                    id: originalPostDoc.id,
                                    ...originalData,
                                    timestamp: originalData?.createdAt ? (originalData.createdAt as admin.firestore.Timestamp).toMillis() : Date.now(),
                                };

                                // Fetch original author
                                const authorDoc = await db.collection('users').doc(originalData?.userId).get();
                                if (authorDoc.exists) {
                                    const authorData = authorDoc.data();
                                    post.originalAuthor = {
                                        id: authorDoc.id,
                                        ...authorData,
                                        username: authorData?.username,
                                        avatarUrl: authorData?.avatarUrl || authorData?.avatar,
                                    };
                                }
                            }
                        } catch (err) {
                            console.error('Error enriching repost:', err);
                        }
                    }

                    return post;
                })
            );

            // Sort by trending score (descending) and limit
            const trendingPosts = postsWithScores
                .sort((a, b) => b.trendingScore - a.trendingScore)
                .slice(0, limitNum)
                .map((post, index) => ({
                    ...post,
                    trendingRank: index + 1
                }));

            return {
                posts: trendingPosts,
                lastId: null // Trending doesn't support pagination
            };
        } catch (error) {
            console.error('Error getting trending posts:', error);
            return { posts: [], lastId: null };
        }
    }
}
