import TrendingPostCard from '@/components/TrendingPostCard';
import { useColorScheme } from '@/components/useColorScheme';
import { MoodType, THEME } from '@/constants/theme';
import { TrendingPost } from '@/services/trendingService';
import { getUserProfile, UserProfile } from '@/services/userService';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TrendingSectionProps {
    posts: TrendingPost[];
    loading?: boolean;
    selectedMood?: MoodType;
}

// Skeleton loader component
function TrendingPostSkeleton() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    return (
        <View style={[styles.skeletonCard, { backgroundColor: theme.card }]}>
            <View style={[styles.skeletonHeader, { backgroundColor: theme.border }]} />
            <View style={[styles.skeletonContent, { backgroundColor: theme.border }]} />
            <View style={[styles.skeletonContent, { backgroundColor: theme.border, width: '70%' }]} />
            <View style={[styles.skeletonFooter, { backgroundColor: theme.border }]} />
        </View>
    );
}

export default function TrendingSection({ posts, loading, selectedMood }: TrendingSectionProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const [users, setUsers] = useState<Record<string, UserProfile>>({});

    useEffect(() => {
        // Fetch user profiles for trending posts
        const fetchUsers = async () => {
            const userIds = [...new Set(posts.map(p => p.userId))];
            const newUsers: Record<string, UserProfile> = { ...users };

            for (const uid of userIds) {
                if (!newUsers[uid]) {
                    const u = await getUserProfile(uid);
                    if (u) {
                        newUsers[uid] = u;
                    }
                }
            }
            setUsers(newUsers);
        };

        if (posts.length > 0) {
            fetchUsers();
        }
    }, [posts]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>🔥 Trending Now</Text>
                {[1, 2, 3].map((i) => (
                    <TrendingPostSkeleton key={`skeleton_${i}`} />
                ))}
            </View>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>🔥 Trending Now</Text>
                <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                    <Text style={[styles.emptyEmoji]}>📊</Text>
                    <Text style={[styles.emptyText, { color: theme.text }]}>
                        No trending posts right now
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                        {selectedMood
                            ? `Try a different mood filter or check back later`
                            : 'Check back later for trending content'}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>
                🔥 Trending Now
                {selectedMood && (
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {' '}· {selectedMood}
                    </Text>
                )}
            </Text>
            {posts.map((post) => {
                const postUser = users[post.userId];
                const displayUser = postUser ? {
                    id: post.userId,
                    username: postUser.username,
                    name: postUser.username,
                    handle: postUser.isAnonymous ? 'Anonymous' : '@' + postUser.username,
                    avatar: postUser.avatarUrl || null,
                    avatarUrl: postUser.avatarUrl || null,
                    moodAura: postUser.themeColor
                } : {
                    id: post.userId,
                    username: 'Loading...',
                    name: 'Loading...',
                    handle: '',
                    avatar: null,
                    avatarUrl: null,
                    moodAura: '#ccc'
                };

                return (
                    <TrendingPostCard
                        key={post.id}
                        post={post}
                        user={displayUser}
                        rank={post.trendingRank}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 16,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        textTransform: 'capitalize',
    },
    skeletonCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
    },
    skeletonHeader: {
        height: 16,
        width: '40%',
        borderRadius: 8,
        marginBottom: 12,
    },
    skeletonContent: {
        height: 12,
        borderRadius: 6,
        marginBottom: 8,
    },
    skeletonFooter: {
        height: 14,
        width: '30%',
        borderRadius: 7,
        marginTop: 8,
    },
    emptyState: {
        marginHorizontal: 16,
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
