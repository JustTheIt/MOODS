import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { useMood } from '@/context/MoodContext';
import { Post, User } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MoreHorizontal, Share2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface PostCardProps {
    post: Post;
    user: User | any;
}

function VideoPlayer({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        player.muted = true; // Suggest muting feed videos by default
        player.play();
    });

    return (
        <VideoView
            style={styles.postImage}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
        />
    );
}

export default function PostCard({ post, user }: PostCardProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();
    const moodColors = MOOD_COLORS[post.mood as MoodType] || MOOD_COLORS.happy;
    const { settings } = useMood();

    // Animation for intensity glow
    const glowOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (settings.reduceMotion) {
            glowOpacity.value = 0.3; // Static if reduced motion
            return;
        }

        if (post.intensity && post.intensity > 0.6) {
            // Pulse animation for high intensity
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        }
    }, [post.intensity, settings.reduceMotion]);

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value
    }));

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Intensity Aura */}
            {settings.glowIntensity && (
                <Animated.View style={[StyleSheet.absoluteFill, animatedGlowStyle]}>
                    <LinearGradient
                        colors={[moodColors.glow, 'transparent']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0.5, y: 0.5 }}
                        end={{ x: 1, y: 1 }}
                    />
                </Animated.View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => !post.anonymous && router.push(`/profile/${user.id}` as any)}
                    disabled={post.anonymous}
                >
                    <Image source={{ uri: post.anonymous ? 'https://i.pravatar.cc/150?u=anon' : (user.avatarUrl || user.avatar) }} style={styles.avatar} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <TouchableOpacity
                        onPress={() => !post.anonymous && router.push(`/profile/${user.id}` as any)}
                        disabled={post.anonymous}
                    >
                        <Text style={[styles.name, { color: theme.text }]}>
                            {post.anonymous ? 'Anonymous Soul' : (user.username || user.name)}
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.handle, { color: theme.textSecondary }]}>
                        {post.anonymous ? 'vibrating...' : (user.handle || ('@' + user.username))} • {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <TouchableOpacity>
                    <MoreHorizontal size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={[styles.moodChip, { backgroundColor: moodColors.secondary }]}>
                    {/* Intensity Dot */}
                    {post.intensity && (
                        <View style={[styles.intensityDot, {
                            backgroundColor: post.intensity > 0.7 ? '#FF4500' : post.intensity > 0.4 ? '#FFD700' : '#87CEEB',
                            opacity: 0.8
                        }]} />
                    )}
                    <Text style={[styles.moodText, { color: moodColors.text }]}>
                        {post.mood.charAt(0).toUpperCase() + post.mood.slice(1)}
                    </Text>
                </View>
                <Text style={[styles.postText, { color: theme.text }]}>{post.content}</Text>
                {post.image && (() => {
                    const isVideo = post.image.match(/\.(mp4|mov|avi|wmv|webm|flv|mkv)$|(\/video\/upload\/)/i);
                    // We need a local player for each video in the list
                    // However, useVideoPlayer is a hook, so we need to be careful inside a FlatList
                    // For a feed, it's better to have a dedicated VideoPlayer component or manage state
                    // For now, I'll create a small sub-component for the video to handle the hook
                    return isVideo ? (
                        <VideoPlayer uri={post.image} />
                    ) : (
                        <Image source={{ uri: post.image }} style={styles.postImage} />
                    );
                })()}
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                {/* No metrics - only interactions */}
                <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={20} color={theme.textSecondary} />
                    <Text style={[styles.actionText, { color: theme.textSecondary }]}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    handle: {
        fontSize: 12,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    moodChip: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    intensityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    moodText: {
        fontSize: 12,
        fontWeight: '600',
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
    }
});
