import { MoodType } from "@/constants/theme";
import api from "@/lib/api";
import { db } from "@/lib/firestore";
import { Comment, Post } from "@/types";
import {
    Timestamp,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
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
        image: data.imageUrl || data.image || undefined,
        mood: data.mood as MoodType,
        intensity: typeof data.intensity === 'number' ? data.intensity : (data.intensity === 'high' ? 0.9 : data.intensity === 'medium' ? 0.6 : 0.3),
        timestamp: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        anonymous: data.anonymous,
        likesCount: data.likesCount || 0,
        commentsCount: data.commentsCount || 0,
        repostsCount: data.repostsCount || 0,
        originalPostId: data.originalPostId,
        mediaMetadata: data.mediaMetadata,
        // For direct firestore, these might be enriched by subscribeToPosts loop later
        originalPost: data.originalPost,
        originalAuthor: data.originalAuthor,
    };
};

// Helper to map API response to Post
const mapApiPostToPost = (data: any): Post => {
    return {
        id: data.id,
        userId: data.userId,
        content: data.content,
        image: data.imageUrl || data.image || undefined,
        mood: data.mood as MoodType,
        intensity: typeof data.intensity === 'number' ? data.intensity : 0.5,
        timestamp: data.timestamp || Date.now(),
        anonymous: data.anonymous,
        likesCount: data.likesCount || 0,
        commentsCount: data.commentsCount || 0,
        repostsCount: data.repostsCount || 0,
        originalPostId: data.originalPostId,
        isLiked: data.isLiked || false,
        mediaMetadata: data.mediaMetadata,
        // Enriched fields from API (backend)
        originalPost: data.originalPost ? mapApiPostToPost(data.originalPost) : undefined,
        originalAuthor: data.originalAuthor,
    };
};

export const createPost = async (postData: { userId: string, content: string, mood: MoodType, intensity: number, anonymous: boolean, originalPostId?: string }, media?: { uri: string, type: 'image' | 'video' }) => {
    try {
        let imageUrl = null;
        let mediaMetadata = null;

        if (media) {
            const uploadResult = await uploadMedia(media.uri, media.type);
            imageUrl = uploadResult.url;
            mediaMetadata = {
                mediaType: uploadResult.mediaType,
                width: uploadResult.width,
                height: uploadResult.height,
                aspectRatio: uploadResult.aspectRatio,
                duration: uploadResult.duration,
            };
        }

        const response = await api.post('/posts', {
            ...postData,
            imageUrl,
            mediaMetadata
        });

        return response.data;
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

export const getUserPosts = async (userId: string) => {
    try {
        const { posts } = await getPosts(null, undefined, userId);
        return posts;
    } catch (error) {
        console.error("Error fetching user posts:", error);
        throw error;
    }
};

export const getPosts = async (lastVisible: any = null, moodFilter?: string, userIdFilter?: string) => {
    try {
        const response = await api.get('/posts/feed', {
            params: {
                lastId: lastVisible,
                mood: moodFilter,
                userId: userIdFilter
            }
        });

        const rawPosts = response.data.posts || [];
        const posts = rawPosts.map(mapApiPostToPost);

        return {
            posts,
            lastVisible: response.data.lastId
        };
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
        await api.post(`/posts/${postId}/like`);
    } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
    }
};

export const addComment = async (postId: string, userId: string, content: string) => {
    try {
        const response = await api.post(`/posts/${postId}/comments`, { content });
        return response.data;
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
        await api.delete(`/posts/${postId}`);
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