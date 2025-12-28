import { db } from "@/lib/firestore";
import { Story } from "@/types";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    where
} from "firebase/firestore";

const STORIES_COLLECTION = "stories";

/**
 * Creates a new story in Firestore
 */
export const createStory = async (storyData: Omit<Story, 'id' | 'createdAt' | 'expiresAt'>) => {
    try {
        const now = Date.now();
        const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours from now

        const newStory = {
            ...storyData,
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromMillis(expiresAt),
        };

        const docRef = await addDoc(collection(db, STORIES_COLLECTION), newStory);
        return { id: docRef.id, ...newStory };
    } catch (error) {
        console.error("Error creating story:", error);
        throw error;
    }
};

/**
 * Subscribes to active stories (unexpired)
 */
export const subscribeToActiveStories = (callback: (stories: Story[]) => void) => {
    const now = Timestamp.now();
    const q = query(
        collection(db, STORIES_COLLECTION),
        where("expiresAt", ">", now),
        orderBy("expiresAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const stories = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toMillis() || Date.now(),
                expiresAt: data.expiresAt?.toMillis() || Date.now() + 86400000,
            } as Story;
        });
        callback(stories);
    });
};

/**
 * Deletes a story manually
 */
export const deleteStory = async (storyId: string) => {
    try {
        await deleteDoc(doc(db, STORIES_COLLECTION, storyId));
    } catch (error) {
        console.error("Error deleting story:", error);
        throw error;
    }
};

/**
 * Marks a story as viewed by the current user
 */
export const markStoryAsViewed = async (userId: string, storyId: string) => {
    try {
        const userStoriesRef = collection(db, "users", userId, "viewedStories");
        await setDoc(doc(userStoriesRef, storyId), {
            viewedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error marking story as viewed:", error);
    }
};

/**
 * Subscribe to the list of stories viewed by the user
 */
export const subscribeToViewedStories = (userId: string, callback: (viewedIds: string[]) => void) => {
    const userStoriesRef = collection(db, "users", userId, "viewedStories");
    return onSnapshot(userStoriesRef, (snapshot) => {
        const viewedIds = snapshot.docs.map(doc => doc.id);
        callback(viewedIds);
    });
};
