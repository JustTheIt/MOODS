import { Avatar } from '@/components/Avatar';
import { useColorScheme } from '@/components/useColorScheme';
import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { SuggestedUser } from '@/services/suggestedUsersService';
import { followUser } from '@/services/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface UserSuggestionCardProps {
    user: SuggestedUser;
    isTopPriority?: boolean; // Top 3 users get animated glow
    onFollowSuccess?: () => void;
}

export default function UserSuggestionCard({ user, isTopPriority, onFollowSuccess }: UserSuggestionCardProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
    const [loading, setLoading] = useState(false);

    // Animated glow for top priority users
    const glowOpacity = useSharedValue(0.6);

    useEffect(() => {
        if (isTopPriority) {
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1500 }),
                    withTiming(0.6, { duration: 1500 })
                ),
                -1,
                true
            );
        }
    }, [isTopPriority]);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value
    }));

    const dominantMood = (user.dominantMood || 'happy') as MoodType;
    const moodColor = MOOD_COLORS[dominantMood];

    const handleFollow = async () => {
        try {
            setLoading(true);
            await followUser(user.id);
            setIsFollowing(true);
            onFollowSuccess?.();
        } catch (error) {
            console.error('Error following user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardPress = () => {
        router.push(`/profile/${user.id}`);
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={handleCardPress}
            activeOpacity={0.7}
        >
            {/* Animated glow for top priority */}
            {isTopPriority && (
                <Animated.View
                    style={[
                        styles.glowContainer,
                        glowStyle,
                        { backgroundColor: moodColor.glow }
                    ]}
                />
            )}

            {/* Avatar with aura ring */}
            <View style={styles.avatarContainer}>
                <LinearGradient
                    colors={moodColor.gradient}
                    style={styles.auraRing}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={[styles.avatarInner, { backgroundColor: theme.card }]}>
                        <Avatar
                            uri={user.avatarUrl || user.avatar}
                            size={56}
                            name={user.username}
                        />
                    </View>
                </LinearGradient>
            </View>

            {/* User info */}
            <Text style={[styles.username, { color: theme.text }]} numberOfLines={1}>
                {user.username}
            </Text>
            {user.displayName && (
                <Text style={[styles.displayName, { color: theme.textSecondary }]} numberOfLines={1}>
                    {user.displayName}
                </Text>
            )}

            {/* Shared moods indicator */}
            {user.sharedMoods && user.sharedMoods.length > 0 && (
                <View style={[styles.moodBadge, { backgroundColor: moodColor.primary + '20' }]}>
                    <Text style={[styles.moodText, { color: moodColor.primary }]}>
                        {user.sharedMoods[0]}
                    </Text>
                </View>
            )}

            {/* Follow button */}
            <TouchableOpacity
                style={[
                    styles.followButton,
                    isFollowing
                        ? { backgroundColor: theme.border, borderColor: theme.border }
                        : { backgroundColor: moodColor.primary, borderColor: moodColor.primary }
                ]}
                onPress={handleFollow}
                disabled={loading || isFollowing}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Text style={[styles.followText, { color: isFollowing ? theme.textSecondary : '#FFF' }]}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 140,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        marginRight: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    glowContainer: {
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
        borderRadius: 20,
        opacity: 0.3,
    },
    avatarContainer: {
        marginBottom: 10,
    },
    auraRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
    },
    avatarInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        justifyContent: 'center',
        alignItems: 'center',
    },
    username: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
        textAlign: 'center',
    },
    displayName: {
        fontSize: 12,
        marginBottom: 6,
        textAlign: 'center',
    },
    moodBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 8,
    },
    moodText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    followText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
