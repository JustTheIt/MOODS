import api from '@/lib/api';
import { User } from '@/types';

export interface SuggestedUser extends User {
    priorityScore?: number;
    sharedMoods?: string[];
    mutualInteractions?: number;
    isFollowing?: boolean;
}

// Simple in-memory cache
let cachedSuggestions: SuggestedUser[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSuggestedUsers(limit: number = 15): Promise<SuggestedUser[]> {
    try {
        // Check cache
        const now = Date.now();
        if (cachedSuggestions && (now - cacheTimestamp) < CACHE_TTL) {
            return cachedSuggestions;
        }

        const response = await api.get('/users/suggested', {
            params: { limit }
        });

        const users = response.data.users || [];

        // Update cache
        cachedSuggestions = users;
        cacheTimestamp = now;

        return users;
    } catch (error) {
        console.error('Error fetching suggested users:', error);
        return [];
    }
}

export function clearSuggestedUsersCache() {
    cachedSuggestions = null;
    cacheTimestamp = 0;
}
