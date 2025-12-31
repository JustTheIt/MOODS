import { MoodType } from '@/constants/theme';
export { MoodType };

export interface User {
    id: string;
    username: string;
    email: string; // Made required as per new flow
    displayName: string; // [NEW]
    dateOfBirth?: string; // [NEW] ISO Date String

    // Profile (Step 2 - Optional)
    avatarUrl?: string; // Keeping both for compatibility if needed, but prefer avatarUrl
    avatar?: string;
    handle?: string;
    bio?: string;
    gender?: 'male' | 'female' | 'non-binary' | 'self-describe' | 'prefer-not-to-say'; // [NEW]
    genderDescription?: string; // [NEW]

    // Settings
    dominantMood?: MoodType;
    themeColor?: string;
    moodAura?: string;
    timezone?: string; // [NEW]
    privacy?: 'public' | 'friends' | 'private'; // [NEW]

    // Metadata
    onboardingCompleted?: boolean; // [NEW]
    termsAcceptedAt?: number; // [NEW]
    createdAt?: number;

    // Legacy/Helper fields
    name?: string; // Often aliased to displayName
    isAnonymous?: boolean;
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
    isLiked?: boolean;
    mediaMetadata?: {
        mediaType: 'image' | 'video';
        width: number;
        height: number;
        aspectRatio: number;
        duration?: number;
        thumbnailUrl?: string;
    };

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
    themeMode: 'light' | 'dark' | 'system';
}

export interface MoodLog {
    id: string;
    userId: string;
    mood: MoodType;
    intensity: number; // 0.0 to 1.0
    note?: string;
    timestamp: number;
}
