import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { useMood } from '@/context/MoodContext';
import { auth } from '@/lib/auth';
import { checkPostLiked, deletePost, repostPost, toggleLikePost } from '@/services/postService';
import { Post, User } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Heart, MessageCircle, Repeat, Share2, Trash } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, Share, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

interface PostCardProps {
    post: Post;
    user: User | any;
}

function VideoPlayer({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        player.muted = true;
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
    const currentUser = auth.currentUser;

    // State for interactions
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0);
    const scale = useSharedValue(1);

    // Animation for intensity glow
    const glowOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (currentUser) {
            checkPostLiked(post.id, currentUser.uid).then(setLiked);
        }
    }, [post.id, currentUser]);

    useEffect(() => {
        if (settings.reduceMotion) {
            glowOpacity.value = 0.3;
            return;
        }

        if (post.intensity && post.intensity > 0.6) {
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

    const animatedHeartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handleLike = async () => {
        if (!currentUser) {
            Alert.alert("Sign in required", "Please sign in to like posts.");
            return;
        }

        // Optimistic update
        const newLiked = !liked;
        const newCount = newLiked ? likesCount + 1 : likesCount - 1;

        setLiked(newLiked);
        setLikesCount(newCount);

        // Animation
        if (newLiked) {
            scale.value = withSequence(
                withSpring(1.2),
                withSpring(1)
            );
        }

        try {
            await toggleLikePost(post.id, currentUser.uid);
        } catch (error) {
            // Revert on error
            setLiked(!newLiked);
            setLikesCount(likesCount);
            console.error(error);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this mood: ${post.content}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleRepost = async () => {
        if (!currentUser) return;
        Alert.alert("Repost this mood?", "It will appear on your profile.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Repost",
                onPress: async () => {
                    try {
                        await repostPost(post.id, currentUser.uid, post.mood);
                        setRepostsCount(c => c + 1);
                        Alert.alert("Success", "Mood reposted!");
                    } catch (error) {
                        Alert.alert("Error", "Could not repost.");
                    }
                }
            }
        ]);
    };

    const handleDelete = () => {
        Alert.alert("Delete Post", "Are you sure? This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deletePost(post.id);
                    } catch (error) {
                        Alert.alert("Error", "Could not delete post.");
                    }
                }
            }
        ]);
    };

    const isOwner = currentUser?.uid === post.userId;

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
                        {post.originalPostId && ' • Reposted'}
                    </Text>
                </View>
                {isOwner && (
                    <TouchableOpacity onPress={handleDelete}>
                        <Trash size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
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

                {post.content ? (
                    <Text style={[styles.postText, { color: theme.text }]}>{post.content}</Text>
                ) : null}

                {/* Repost Content */}
                {post.originalPost ? (
                    <View style={[styles.repostContainer, { borderColor: theme.border, backgroundColor: theme.background }]}>
                        <View style={styles.repostHeader}>
                            <Image
                                source={{ uri: post.originalAuthor?.avatarUrl || 'https://i.pravatar.cc/150' }}
                                style={styles.repostAvatar}
                            />
                            <Text style={[styles.repostAuthor, { color: theme.text }]}>
                                {post.originalAuthor?.username || 'Unknown User'}
                            </Text>
                        </View>
                        <Text style={[styles.postText, { color: theme.text }]}>{post.originalPost.content}</Text>
                        {post.originalPost.image && (() => {
                            const isVideo = post.originalPost.image.match(/\.(mp4|mov|avi|wmv|webm|flv|mkv)$|(\/video\/upload\/)/i);
                            return isVideo ? (
                                <VideoPlayer uri={post.originalPost.image} />
                            ) : (
                                <Image source={{ uri: post.originalPost.image }} style={styles.postImage} />
                            );
                        })()}
                    </View>
                ) : (
                    /* Regular Post Image */
                    post.image && (() => {
                        const isVideo = post.image.match(/\.(mp4|mov|avi|wmv|webm|flv|mkv)$|(\/video\/upload\/)/i);
                        return isVideo ? (
                            <VideoPlayer uri={post.image} />
                        ) : (
                            <Image source={{ uri: post.image }} style={styles.postImage} />
                        );
                    })()
                )}
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>

                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Animated.View style={animatedHeartStyle}>
                        <Heart size={20} color={liked ? "#ff4040" : theme.textSecondary} fill={liked ? "#ff4040" : "transparent"} />
                    </Animated.View>
                    <Text style={[styles.actionText, { color: liked ? "#ff4040" : theme.textSecondary }]}>
                        {likesCount > 0 ? likesCount : 'Like'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/post/${post.id}` as any)}>
                    <MessageCircle size={20} color={theme.textSecondary} />
                    <Text style={[styles.actionText, { color: theme.textSecondary }]}>
                        {post.commentsCount && post.commentsCount > 0 ? post.commentsCount : 'Comment'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleRepost}>
                    <Repeat size={20} color={theme.textSecondary} />
                    <Text style={[styles.actionText, { color: theme.textSecondary }]}>
                        {repostsCount > 0 ? repostsCount : 'Repost'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Share2 size={20} color={theme.textSecondary} />
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
    },
    repostContainer: {
        marginTop: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    repostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    repostAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    repostAuthor: {
        fontWeight: '600',
        fontSize: 14,
    }
});
