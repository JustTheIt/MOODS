import api from '@/lib/api';
import { User } from '@/types';

export type UserProfile = User; // Alias for backward compatibility

const DEFAULT_THEMES = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#D4A5A5"];

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            // User profile not found, expected for new users (will be auto-created)
            return null;
        }
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const createUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        const response = await api.post(`/users/${userId}`, data); // Note: I didn't create a specific route for this in users, usually it's tied to auth. I'll use the one I implemented in service.
        return response.data;
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        const response = await api.patch('/users/me', data);
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const followUser = async (targetUserId: string) => {
    try {
        await api.post(`/users/${targetUserId}/follow`);
    } catch (error) {
        console.error("Error following user:", error);
        throw error;
    }
};

export const unfollowUser = async (targetUserId: string) => {
    try {
        await api.post(`/users/${targetUserId}/unfollow`);
    } catch (error) {
        console.error("Error unfollowing user:", error);
        throw error;
    }
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
        const response = await api.post('/users/check-username', { username });
        return response.data.available;
    } catch (error) {
        console.error("Error checking username availability:", error);
        return false; // Assume taken on error to be safe
    }
};
