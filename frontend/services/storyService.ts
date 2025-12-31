import api from "@/lib/api";
import { Story } from "@/types";

const STORIES_COLLECTION = "stories";

/**
 * Creates a new story in Firestore
 */
export const createStory = async (storyData: Omit<Story, 'id' | 'createdAt' | 'expiresAt'>) => {
    try {
        const response = await api.post('/stories', storyData);
        return response.data;
    } catch (error) {
        console.error("Error creating story:", error);
        throw error;
    }
};

/**
 * Subscribes to active stories (unexpired)
 */
export const getActiveStories = async () => {
    try {
        const response = await api.get('/stories');
        return response.data;
    } catch (error) {
        console.error("Error fetching active stories:", error);
        return [];
    }
};

/**
 * Deletes a story manually
 */
export const deleteStory = async (storyId: string) => {
    try {
        await api.delete(`/stories/${storyId}`);
    } catch (error) {
        console.error("Error deleting story:", error);
        throw error;
    }
};

/**
 * Marks a story as viewed by the current user
 */
export const markStoryAsViewed = async (storyId: string) => {
    try {
        await api.post(`/stories/${storyId}/view`);
    } catch (error) {
        console.error("Error marking story as viewed:", error);
    }
};

/**
 * Subscribe to the list of stories viewed by the user
 */
export const getViewedStories = async () => {
    try {
        const response = await api.get('/stories/viewed');
        return response.data;
    } catch (error) {
        console.error("Error fetching viewed stories:", error);
        return [];
    }
};
