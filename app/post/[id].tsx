import PostCard from '@/components/PostCard';
import { THEME } from '@/constants/theme';
import { useMood } from '@/context/MoodContext';
import { auth } from '@/lib/auth';
import { addComment, getComments, getPostById } from '@/services/postService';
import { Comment, Post } from '@/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send, User as UserIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image as RNImage,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();
    const { settings } = useMood();
    const currentUser = auth.currentUser;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [postData, commentsData] = await Promise.all([
                getPostById(id),
                getComments(id)
            ]);
            setPost(postData);
            setComments(commentsData);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not load post details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim() || !currentUser || !id) return;
        setSending(true);
        try {
            await addComment(id, currentUser.uid, newComment.trim());
            setNewComment('');
            // Refresh comments
            const updatedComments = await getComments(id);
            setComments(updatedComments);
            // Also refresh post to update comment count (optional, but good)
            const updatedPost = await getPostById(id);
            if (updatedPost) setPost(updatedPost);
        } catch (error) {
            Alert.alert("Error", "Could not post comment.");
        } finally {
            setSending(false);
        }
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={[styles.commentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.commentHeader}>
                <View style={styles.commentUser}>
                    {item.user?.avatarUrl ? (
                        <RNImage source={{ uri: item.user.avatarUrl }} style={styles.avatarPlaceholder} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: THEME.primary }]}>
                            <UserIcon size={12} color="#FFF" />
                        </View>
                    )}
                    <Text style={[styles.commentAuthor, { color: theme.textSecondary }]}>
                        {item.user?.username || 'User'}
                    </Text>
                </View>
                <Text style={[styles.commentTime, { color: theme.textSecondary }]}>
                    {new Date(item.timestamp).toLocaleDateString()}
                </Text>
            </View>
            <Text style={[styles.commentContent, { color: theme.text }]}>{item.content}</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={THEME.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!post) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.center}>
                    <Text style={{ color: theme.text }}>Post not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Mock user object for PostCard if needed, or fetch author details
    // For now passing minimal user object since PostCard handles it safely
    const postUser = {
        id: post.userId,
        username: "User", // Ideally fetch this
        avatarUrl: null
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={{ color: theme.text, fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Mood</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                style={{ flex: 1 }}
            >
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={() => (
                        <View style={styles.postContainer}>
                            <PostCard post={post} user={postUser} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Comments</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                />

                {/* Input Area */}
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                        placeholder="Share your thoughts..."
                        placeholderTextColor={theme.textSecondary}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: THEME.primary, opacity: !newComment.trim() ? 0.5 : 1 }]}
                        onPress={handleSendComment}
                        disabled={!newComment.trim() || sending}
                    >
                        {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Send size={20} color="#FFF" />}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    postContainer: {
        marginBottom: 20,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    commentCard: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    commentUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    avatarPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
    },
    commentTime: {
        fontSize: 12,
    },
    commentContent: {
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minHeight: 40,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
