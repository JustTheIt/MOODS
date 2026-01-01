import api from '@/lib/api';
import { Post } from '@/types';

export interface TrendingPost extends Post {
    trendingScore?: number;
    trendingRank?: number;
    trendingReason?: string;
}

// Simple in-memory cache
let cachedTrending: { posts: TrendingPost[], mood?: string } | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getTrendingPosts(limit: number = 20, mood?: string): Promise<TrendingPost[]> {
    try {
        // Check cache (invalidate if mood filter changed)
        const now = Date.now();
        if (cachedTrending &&
            cachedTrending.mood === mood &&
            (now - cacheTimestamp) < CACHE_TTL) {
            return cachedTrending.posts;
        }

        const response = await api.get('/posts/trending', {
            params: { limit, mood }
        });

        const posts = response.data.posts || [];

        // Update cache
        cachedTrending = { posts, mood };
        cacheTimestamp = now;

        return posts;
    } catch (error) {
        console.error('Error fetching trending posts:', error);
        return [];
    }
}

export function clearTrendingCache() {
    cachedTrending = null;
    cacheTimestamp = 0;
}
