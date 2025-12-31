import { Avatar } from '@/components/Avatar';
import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getActiveStories, getViewedStories } from '@/services/storyService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Story } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Plus, Repeat } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
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

    const isDark = colorScheme === 'dark';

    useEffect(() => {
        const loadData = async () => {
            // 1. Fetch active stories
            const fetchedStories = await getActiveStories();
            setStories(fetchedStories);

            const userIds = [...new Set(fetchedStories.map((s: Story) => s.userId))];
            for (const uid of userIds) {
                if (!users[uid as string]) {
                    const u = await getUserProfile(uid as string);
                    if (u) {
                        setUsers(prev => ({ ...prev, [uid as string]: u }));
                    }
                }
            }

            // 2. Fetch viewed stories if user is logged in
            if (user) {
                const ids = await getViewedStories();
                setViewedStoryIds(new Set(ids));
            }
        };

        loadData();
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
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Today's Stories</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionCircle}>
                        <Repeat size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCircle}>
                        <View style={styles.dotRow}>
                            <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                            <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                            <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={styles.myStory}
                    onPress={() => router.push('/stories/create' as any)}
                >
                    <View style={[styles.shareBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                        <Plus color={theme.text} size={28} />
                    </View>
                    <Text style={[styles.name, { color: theme.textSecondary, marginTop: 4 }]}>Share</Text>
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
                                    <Avatar
                                        uri={poster?.avatarUrl}
                                        name={poster?.username || '?'}
                                        size={56}
                                    />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotRow: {
        flexDirection: 'row',
        gap: 2,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 20,
    },
    myStory: {
        alignItems: 'center',
    },
    shareBtn: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
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
