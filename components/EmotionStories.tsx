import { MOOD_COLORS, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { subscribeToActiveStories, subscribeToViewedStories } from '@/services/storyService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Story } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

export default function EmotionStories() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const { user } = useAuth();
    const router = useRouter();
    const [stories, setStories] = useState<Story[]>([]);
    const [users, setUsers] = useState<Record<string, UserProfile>>({});
    const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        let unsubscribeStories: () => void;
        let unsubscribeViewed: () => void;

        // 1. Subscribe to active stories
        unsubscribeStories = subscribeToActiveStories((fetchedStories) => {
            setStories(fetchedStories);

            const userIds = [...new Set(fetchedStories.map(s => s.userId))];
            userIds.forEach(async (uid) => {
                if (!users[uid]) {
                    const u = await getUserProfile(uid);
                    if (u) {
                        setUsers(prev => ({ ...prev, [uid]: u }));
                    }
                }
            });
        });

        // 2. Subscribe to viewed stories if user is logged in
        if (user) {
            unsubscribeViewed = subscribeToViewedStories(user.uid, (ids) => {
                setViewedStoryIds(new Set(ids));
            });
        }

        return () => {
            if (unsubscribeStories) unsubscribeStories();
            if (unsubscribeViewed) unsubscribeViewed();
        };
    }, [user]);

    // Group stories and simple sort: Unseen first
    const storyUsers = React.useMemo(() => {
        const uniqueUserStories = stories.reduce((acc, story) => {
            // Keep the LATEST story for the user preview
            if (!acc[story.userId] || story.createdAt > acc[story.userId].createdAt) {
                acc[story.userId] = story;
            }
            return acc;
        }, {} as Record<string, Story>);

        return Object.values(uniqueUserStories).sort((a, b) => {
            const aViewed = viewedStoryIds.has(a.id);
            const bViewed = viewedStoryIds.has(b.id);
            if (aViewed === bViewed) return b.createdAt - a.createdAt; // Newest first
            return aViewed ? 1 : -1; // Unseen first
        });
    }, [stories, viewedStoryIds]);

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>Today's Stories</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Create Story Button */}
                <TouchableOpacity
                    style={styles.myStory}
                    onPress={() => router.push('/stories/create' as any)}
                >
                    <View style={[styles.addBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
                        <Plus color={theme.text} size={24} />
                    </View>
                    <Text style={[styles.name, { color: theme.text }]}>Share</Text>
                </TouchableOpacity>

                {/* Active Stories */}
                {storyUsers.map((story) => {
                    const poster = users[story.userId];
                    const isViewed = viewedStoryIds.has(story.id);
                    const moodColor = MOOD_COLORS[story.mood as keyof typeof MOOD_COLORS]?.primary || '#4ECDC4';

                    // Use gray for viewed stories, mood color for new ones
                    const ringColors = isViewed
                        ? [theme.border, theme.border]
                        : [moodColor, moodColor + '40'];

                    return (
                        <TouchableOpacity
                            key={story.id}
                            style={styles.storyItem}
                            onPress={() => router.push({
                                pathname: '/stories/viewer',
                                params: { initialStoryId: story.id } as any
                            })}
                        >
                            <LinearGradient
                                colors={ringColors as any}
                                style={styles.storyRing}
                            >
                                <View style={[styles.storyInner, { backgroundColor: theme.background }]}>
                                    {poster?.avatarUrl ? (
                                        <Image source={{ uri: poster.avatarUrl }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatar, styles.placeholderAvatar]}>
                                            <Text style={styles.placeholderText}>
                                                {poster?.username?.charAt(0) || '?'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </LinearGradient>
                            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                                {poster?.username || 'Loading'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 15,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 15,
    },
    myStory: {
        alignItems: 'center',
        gap: 5,
    },
    addBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    storyItem: {
        alignItems: 'center',
        gap: 5,
    },
    storyRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    placeholderAvatar: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#999',
    },
    name: {
        fontSize: 12,
        fontWeight: '500',
    }
});
