import { MoodLog, Post, User } from "@/types";
import { subDays } from 'date-fns';

export const MOCK_USERS: Record<string, User> = {
    'u1': { id: 'u1', username: 'Alice', name: 'Alice', handle: '@alice', avatar: 'https://i.pravatar.cc/150?u=a', moodAura: 'happy' },
    'u2': { id: 'u2', username: 'Bob', name: 'Bob', handle: '@bob', avatar: 'https://i.pravatar.cc/150?u=b', moodAura: 'sad' },
    'u3': { id: 'u3', username: 'Charlie', name: 'Charlie', handle: '@charlie', avatar: 'https://i.pravatar.cc/150?u=c', moodAura: 'calm' },
};

export const MOCK_POSTS: Post[] = [
    {
        id: 'p1',
        userId: 'u1',
        content: 'Just had the best coffee ever! ☕️ Sunshine makes everything better.',
        mood: 'happy',
        timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
        intensity: 0.9,
        image: undefined,
    },
    {
        id: 'p2',
        userId: 'u2',
        content: 'Feeling a bit under the weather today. Rain always brings the blues. 🌧️',
        mood: 'sad',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        intensity: 0.5,
        image: undefined,
    },
    {
        id: 'p3',
        userId: 'u3',
        content: 'Meditation session was exactly what I needed. Peace within. 🧘‍♀️',
        mood: 'calm',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
        intensity: 0.8,
    },
    {
        id: 'p4',
        userId: 'u1',
        content: 'Can’t believe the traffic today! 😡',
        mood: 'angry',
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        intensity: 1.0,
        image: undefined,
    },
    {
        id: 'p5',
        userId: 'u2',
        content: 'So much love for my friends who supported me.',
        mood: 'love',
        timestamp: Date.now() - 1000 * 60 * 60 * 26,
        intensity: 0.7,
        image: undefined,
    }
];

// Mock logging for the last 7 days
export const MOCK_MOOD_LOGS: MoodLog[] = [
    { id: 'l1', userId: 'u1', mood: 'happy', timestamp: Date.now(), intensity: 0.6 },
    { id: 'l2', userId: 'u1', mood: 'calm', timestamp: subDays(Date.now(), 1).getTime(), intensity: 0.8 },
    { id: 'l3', userId: 'u1', mood: 'tired', timestamp: subDays(Date.now(), 2).getTime(), intensity: 0.4 },
    { id: 'l4', userId: 'u1', mood: 'happy', timestamp: subDays(Date.now(), 3).getTime(), intensity: 0.7 },
    { id: 'l5', userId: 'u1', mood: 'anxious', timestamp: subDays(Date.now(), 4).getTime(), intensity: 0.9 },
    { id: 'l6', userId: 'u1', mood: 'sad', timestamp: subDays(Date.now(), 5).getTime(), intensity: 0.5 },
    { id: 'l7', userId: 'u1', mood: 'happy', timestamp: subDays(Date.now(), 6).getTime(), intensity: 0.6 },
];
