import { MoodType } from "@/constants/theme";
import { db } from "@/lib/firestore";
import { Comment, Post } from "@/types";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    startAfter,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { uploadMedia } from "./storageService";
import { getUserProfile } from "./userService";

// Helper to map Firestore doc to Post
const mapDocToPost = (doc: any): Post => {
    const data = doc.data();
    return {
        id: doc.id,
        userId: data.userId,
        content: data.content,
        image: data.imageUrl || undefined,
        mood: data.mood as MoodType,
        intensity: data.intensity === 'high' ? 0.9 : data.intensity === 'medium' ? 0.6 : 0.3,
        timestamp: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        anonymous: data.anonymous,
        likesCount: data.likesCount || 0,
        commentsCount: data.commentsCount || 0,
        repostsCount: data.repostsCount || 0,
        originalPostId: data.originalPostId,
    };
};

export const createPost = async (postData: { userId: string, content: string, mood: MoodType, intensity: number, anonymous: boolean, originalPostId?: string }, media?: { uri: string, type: 'image' | 'video' }) => {
    try {
        let imageUrl = null;
        if (media) {
            imageUrl = await uploadMedia(media.uri, media.type);
        }

        const intensityString = postData.intensity > 0.7 ? 'high' : postData.intensity > 0.4 ? 'medium' : 'low';

        const newPost = {
            userId: postData.userId,
            content: postData.content,
            mood: postData.mood,
            intensity: intensityString,
            anonymous: postData.anonymous,
            imageUrl,
            originalPostId: postData.originalPostId || null,
            likesCount: 0,
            commentsCount: 0,
            repostsCount: 0,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "posts"), newPost);

        // If it's a repost, update the original post's repost count
        if (postData.originalPostId) {
            const originalPostRef = doc(db, "posts", postData.originalPostId);
            await updateDoc(originalPostRef, { repostsCount: increment(1) });
        }

        return { id: docRef.id, ...newPost };
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};

export const repostPost = async (originalPostId: string, userId: string, mood: MoodType) => {
    return createPost({
        userId,
        content: "", // Reposts might not have new content initially, or we could pass it
        mood,
        intensity: 0.5,
        anonymous: false,
        originalPostId
    });
};

export const subscribeToPosts = (callback: (posts: Post[]) => void, moodFilter?: string) => {
    let q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(20)
    );

    if (moodFilter) {
        q = query(q, where("mood", "==", moodFilter));
    }

    return onSnapshot(q, async (snapshot) => {
        const posts = snapshot.docs.map(mapDocToPost);

        // Enrich posts with repost data
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            if (post.originalPostId) {
                try {
                    const originalPost = await getPostById(post.originalPostId);
                    if (originalPost) {
                        post.originalPost = originalPost;
                        post.originalAuthor = await getUserProfile(originalPost.userId) as any;
                    }
                } catch (e) {
                    console.error("Error fetching original post for repost:", e);
                }
            }
            return post;
        }));

        callback(enrichedPosts);
    });
};

export const subscribeToUserPosts = (userId: string, callback: (posts: Post[]) => void) => {
    const q = query(
        collection(db, "posts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(20)
    );

    return onSnapshot(q, async (snapshot) => {
        const posts = snapshot.docs.map(mapDocToPost);

        // Enrich posts with repost data
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            if (post.originalPostId) {
                try {
                    const originalPost = await getPostById(post.originalPostId);
                    if (originalPost) {
                        post.originalPost = originalPost;
                        post.originalAuthor = await getUserProfile(originalPost.userId) as any;
                    }
                } catch (e) {
                    console.error("Error fetching original post for repost:", e);
                }
            }
            return post;
        }));

        callback(enrichedPosts);
    });
};

export const getPosts = async (lastVisible: any = null, moodFilter?: string) => {
    try {
        let q = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        if (moodFilter) {
            q = query(q, where("mood", "==", moodFilter));
        }

        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(mapDocToPost);

        // Enrich posts with repost data
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            if (post.originalPostId) {
                try {
                    const originalPost = await getPostById(post.originalPostId);
                    if (originalPost) {
                        post.originalPost = originalPost;
                        post.originalAuthor = await getUserProfile(originalPost.userId) as any;
                    }
                } catch (e) {
                    console.error("Error fetching original post for repost:", e);
                }
            }
            return post;
        }));

        return { posts: enrichedPosts, lastVisible: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};

export const getPostById = async (postId: string) => {
    try {
        const docSnap = await getDoc(doc(db, "posts", postId));
        if (docSnap.exists()) {
            return mapDocToPost(docSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching post:", error);
        throw error;
    }
};

export const toggleLikePost = async (postId: string, userId: string) => {
    try {
        const likeRef = doc(db, "posts", postId, "likes", userId);
        const postRef = doc(db, "posts", postId);

        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                transaction.delete(likeRef);
                transaction.update(postRef, { likesCount: increment(-1) });
            } else {
                transaction.set(likeRef, { userId, createdAt: serverTimestamp() });
                transaction.update(postRef, { likesCount: increment(1) });
            }
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
    }
};

export const addComment = async (postId: string, userId: string, content: string) => {
    try {
        const commentData = {
            userId,
            content,
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "posts", postId, "comments"), commentData);
        await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1) });
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};

export const getComments = async (postId: string) => {
    try {
        const q = query(
            collection(db, "posts", postId, "comments"),
            orderBy("createdAt", "asc")
        );
        const snapshot = await getDocs(q);

        const comments = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const comment: Comment = {
                id: doc.id,
                postId,
                userId: data.userId,
                content: data.content,
                timestamp: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
            };

            // Enrich with user data
            try {
                const userProfile = await getUserProfile(data.userId);
                if (userProfile) {
                    comment.user = userProfile as any;
                }
            } catch (e) {
                console.error("Error fetching comment user:", e);
            }

            return comment;
        }));

        return comments;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

export const deletePost = async (postId: string) => {
    try {
        await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
        console.error("Error deleting post:", error);
        throw error;
    }
};

export const checkPostLiked = async (postId: string, userId: string) => {
    try {
        const docSnap = await getDoc(doc(db, "posts", postId, "likes", userId));
        return docSnap.exists();
    } catch (error) {
        console.error("Error checking like:", error);
        return false;
    }
};