import { MoodType } from '@/constants/theme';
export { MoodType };

export interface User {
    id: string;
    username: string;
    name?: string; // compatibility
    email?: string;
    avatarUrl?: string;
    avatar?: string; // compatibility
    handle?: string; // compatibility
    bio?: string;
    dominantMood?: MoodType;
    themeColor?: string;
    moodAura?: string; // compatibility
    createdAt?: number;
}

export type IntensityLevel = 'low' | 'medium' | 'high';

export interface Post {
    id: string;
    userId: string;
    content: string;
    image?: string;
    mood: MoodType;
    intensity: number; // 0.0 to 1.0
    timestamp: number;
    anonymous?: boolean;
    likesCount?: number;
    commentsCount?: number;
    repostsCount?: number;
    originalPostId?: string; // For reposts

    // Joined data
    originalPost?: Post | null;
    originalAuthor?: User | null;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    timestamp: number;

    // Joined data
    user?: User | null;
}

export interface Story {
    id: string;
    userId: string;
    type: 'text' | 'image';
    text?: string;
    mediaUrl?: string;
    mood: MoodType;
    createdAt: number;
    expiresAt: number;
    anonymous?: boolean;
}

export interface AppSettings {
    reduceMotion: boolean;
    glowIntensity: boolean;
    highContrast: boolean;
}

export interface MoodLog {
    id: string;
    userId: string;
    mood: MoodType;
    intensity: number; // 0.0 to 1.0
    note?: string;
    timestamp: number;
}
