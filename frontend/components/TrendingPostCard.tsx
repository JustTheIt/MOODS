import PostCard from '@/components/PostCard';
import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { TrendingPost } from '@/services/trendingService';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TrendingPostCardProps {
    post: TrendingPost;
    user: any;
    rank?: number;
}

export default function TrendingPostCard({ post, user, rank }: TrendingPostCardProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const moodColor = MOOD_COLORS[post.mood as MoodType] || MOOD_COLORS.happy;

    return (
        <View style={styles.container}>
            {/* Mood-colored border glow */}
            <LinearGradient
                colors={[moodColor.primary + '40', moodColor.primary + '10']}
                style={styles.glowBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={[styles.cardWrapper, { backgroundColor: theme.card }]}>
                    {/* Trending badge */}
                    <View style={[styles.trendingBadge, { backgroundColor: moodColor.primary }]}>
                        <Text style={styles.badgeEmoji}>🔥</Text>
                        <Text style={styles.badgeText}>Trending</Text>
                        {rank && rank <= 3 && (
                            <Text style={styles.rankText}>#{rank}</Text>
                        )}
                    </View>

                    {/* Mood intensity indicator */}
                    <View style={styles.intensityContainer}>
                        <View style={styles.reasonHeader}>
                            <Text style={[styles.intensityLabel, { color: theme.textSecondary }]}>
                                {Math.round((post.intensity || 0.5) * 100)}% intensity
                            </Text>
                            {post.trendingReason && (
                                <Text style={[styles.trendingReason, { color: moodColor.primary }]}>
                                    • {post.trendingReason}
                                </Text>
                            )}
                        </View>
                        <View style={[styles.intensityBar, { backgroundColor: theme.border }]}>
                            <View
                                style={[
                                    styles.intensityFill,
                                    {
                                        width: `${(post.intensity || 0.5) * 100}%`,
                                        backgroundColor: moodColor.primary,
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    {/* Regular post card */}
                    <PostCard post={post} user={user} flat={true} />
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        marginHorizontal: 12,
    },
    glowBorder: {
        borderRadius: 20,
        padding: 2,
    },
    cardWrapper: {
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
    },
    trendingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        zIndex: 10,
        gap: 4,
    },
    badgeEmoji: {
        fontSize: 12,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    rankText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 2,
    },
    intensityContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    reasonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    trendingReason: {
        fontSize: 10,
        fontWeight: '600',
        fontStyle: 'italic',
    },
    intensityBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    intensityFill: {
        height: '100%',
        borderRadius: 2,
    },
    intensityLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
});
