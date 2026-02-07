
import { Avatar } from '@/components/Avatar';
import { useTheme } from '@/hooks/useTheme'; // Dynamic Theme Hook
import { auth } from '@/lib/auth';
import { checkPostLiked, deletePost, repostPost, toggleLikePost } from '@/services/postService';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Post, User } from '@/types';
import { formatRelativeTime } from '@/utils/time.utils';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Heart, MessageCircle, Repeat, Share2, Trash } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PostCardProps {
    post: Post;
    user: User | any;
    flat?: boolean;
}

function VideoPlayer({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        player.muted = true;
        player.play();
    });

    return (
        <VideoView
            style={styles.postMedia}
            player={player}
            contentFit="cover"
            nativeControls={false}
        />
    );
}

export default function PostCard({ post, user, flat }: PostCardProps) {
    const theme = useTheme(); // Use dynamic theme
    const router = useRouter();
    const currentUser = auth.currentUser;
    const isOwner = currentUser?.uid === post.userId;

    // State for interactions
    const [liked, setLiked] = useState(post.isLiked || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0);

    useEffect(() => {
        if (currentUser && post.isLiked === undefined) {
            checkPostLiked(post.id, currentUser.uid).then(setLiked);
        } else if (post.isLiked !== undefined) {
            setLiked(post.isLiked);
        }
    }, [post.id, post.isLiked, currentUser]);

    const handleLike = async () => {
        if (!currentUser) {
            Alert.alert("Sign in required", "Please sign in to like posts.");
            return;
        }

        const newLiked = !liked;
        const newCount = newLiked ? likesCount + 1 : likesCount - 1;

        setLiked(newLiked);
        setLikesCount(newCount);

        try {
            await toggleLikePost(post.id, currentUser.uid);
        } catch (error) {
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

    const navigateToViewer = (uri: string, type: 'image' | 'video', aspectRatio?: number) => {
        router.push({
            pathname: '/post/viewer',
            params: { uri, type, aspectRatio: aspectRatio?.toString() }
        } as any);
    };

    const renderMedia = (uri: string, metadata?: any) => {
        const isVideo = uri.match(/\.(mp4|mov|avi|wmv|webm|flv|mkv)$|(\/video\/upload\/)/i) || metadata?.mediaType === 'video';

        return (
            <Pressable
                onPress={() => navigateToViewer(uri, isVideo ? 'video' : 'image', metadata?.aspectRatio)}
                style={styles.mediaContainer}
            >
                {isVideo ? (
                    <VideoPlayer uri={uri} />
                ) : (
                    <Image
                        source={{ uri }}
                        style={styles.postMedia}
                        contentFit="cover"
                        transition={0} // No transition
                        cachePolicy="memory-disk"
                    />
                )}
            </Pressable>
        );
    };

    return (
        <View style={[
            styles.card,
            { backgroundColor: theme.card, borderBottomColor: theme.divider },
            flat && { marginBottom: 0, borderBottomWidth: 1 }
        ]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => !post.anonymous && router.push(`/profile/${user.id}` as any)}
                    disabled={post.anonymous}
                >
                    <Avatar
                        uri={post.anonymous ? null : (user.avatarUrl || user.avatar)}
                        name={post.anonymous ? 'Anonymous' : (user.displayName || user.username || user.name)}
                        size={40}
                    />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <TouchableOpacity
                        onPress={() => !post.anonymous && router.push(`/profile/${user.id}` as any)}
                        disabled={post.anonymous}
                    >
                        <Text style={[styles.name, { color: theme.textPrimary }]}>
                            {post.anonymous ? 'Anonymous Soul' : (user.username || user.name)}
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.handle, { color: theme.textSecondary }]}>
                        {post.anonymous ? '@anonymous' : (user.handle || ('@' + user.username))} • {formatRelativeTime(post.timestamp)}
                        {post.originalPostId && <Text style={{ fontWeight: '600' }}> • Reposted</Text>}
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
                {post.mood && (
                    <View style={[styles.moodLabel, { borderLeftColor: theme.calm }]}>
                        <Text style={[styles.moodText, { color: theme.textSecondary }]}>
                            {post.mood.toUpperCase()}
                        </Text>
                    </View>
                )}

                {post.content ? (
                    <Text style={[styles.postText, { color: theme.textPrimary }]}>{post.content}</Text>
                ) : null}

                {/* Media Section */}
                {post.originalPost ? (
                    <View style={[styles.repostContainer, { backgroundColor: theme.background }]}>
                        <View style={styles.repostHeader}>
                            <Avatar
                                uri={post.originalAuthor?.avatarUrl}
                                name={post.originalAuthor?.displayName || post.originalAuthor?.username || post.originalAuthor?.name}
                                size={24}
                                style={{ marginRight: 8 }}
                            />
                            <Text style={[styles.repostAuthor, { color: theme.textPrimary }]}>
                                {post.originalAuthor?.username || 'Unknown User'}
                            </Text>
                        </View>
                        <Text style={[styles.postText, { color: theme.textPrimary }]}>{post.originalPost.content}</Text>
                        {post.originalPost.image && renderMedia(post.originalPost.image, post.originalPost.mediaMetadata)}
                    </View>
                ) : (
                    post.image && renderMedia(post.image, post.mediaMetadata)
                )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Heart size={20} color={liked ? theme.error : theme.textSecondary} fill={liked ? theme.error : "transparent"} />
                    <Text style={[styles.actionText, { color: liked ? theme.error : theme.textSecondary }]}>
                        {likesCount > 0 ? likesCount : ''}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/post/${post.id}` as any)}>
                    <MessageCircle size={20} color={theme.textSecondary} />
                    <Text style={[styles.actionText, { color: theme.textSecondary }]}>
                        {post.commentsCount && post.commentsCount > 0 ? post.commentsCount : ''}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleRepost}>
                    <Repeat size={20} color={theme.textSecondary} />
                    <Text style={[styles.actionText, { color: theme.textSecondary }]}>
                        {repostsCount > 0 ? repostsCount : ''}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Share2 size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        paddingBottom: spacing.m,
        marginBottom: 12, // Distinct gap
        borderBottomWidth: StyleSheet.hairlineWidth,
        // Optional: Add shadow for depth if 'flat' is not desired, but let's stick to clean separation first
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingTop: spacing.m,
        paddingBottom: spacing.s,
    },
    headerText: {
        flex: 1,
        marginLeft: spacing.s,
    },
    name: {
        fontSize: 16,
        fontWeight: typography.medium as any,
        marginBottom: 2,
    },
    handle: {
        fontSize: 14,
    },
    content: {
        paddingHorizontal: spacing.m,
        paddingBottom: spacing.s,
    },
    moodLabel: {
        alignSelf: 'flex-start',
        borderLeftWidth: 2,
        paddingLeft: 8,
        marginBottom: 8,
    },
    moodText: {
        fontSize: 12,
        fontWeight: typography.semibold as any,
        letterSpacing: 1,
    },
    postText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: spacing.m,
    },
    mediaContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.05)', // Match screen background for placeholders
        marginTop: spacing.s,
    },
    postMedia: {
        width: '100%',
        height: '100%',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        justifyContent: 'flex-start',
        gap: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    repostContainer: {
        padding: spacing.m,
        borderRadius: 8,
        marginTop: spacing.s,
    },
    repostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    repostAuthor: {
        fontWeight: '600',
        fontSize: 14,
    },
});
