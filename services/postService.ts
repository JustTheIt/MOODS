import { MoodType } from "@/constants/theme";
import { db } from "@/lib/firestore";
import { Post } from "@/types";
import {
    addDoc,
    collection,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    startAfter,
    Timestamp,
    where
} from "firebase/firestore";
import { uploadMedia } from "./storageService";

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
        // Default conversion if saved as number or missing
    };
};

export const createPost = async (postData: { userId: string, content: string, mood: MoodType, intensity: number, anonymous: boolean }, media?: { uri: string, type: 'image' | 'video' }) => {
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
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "posts"), newPost);
        return { id: docRef.id, ...newPost };
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
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

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(mapDocToPost);
        callback(posts);
    });
};

export const subscribeToUserPosts = (userId: string, callback: (posts: Post[]) => void) => {
    const q = query(
        collection(db, "posts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(20)
    );

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(mapDocToPost);
        callback(posts);
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

        return { posts, lastVisible: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};
