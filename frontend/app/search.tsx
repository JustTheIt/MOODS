import PostCard from '@/components/PostCard';
import { useColorScheme } from '@/components/useColorScheme';
import { THEME as IMPORT_THEME } from '@/constants/theme';
import { useMood } from '@/context/MoodContext';
import { getPosts } from '@/services/postService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Post } from '@/types';
import { useRouter } from 'expo-router';
import { Clock, Search as SearchIcon, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME = IMPORT_THEME;

const SAVED_SEARCHES = ['Happy mornings', 'Calm nights', 'Rainy moods'];
const SUGGESTIONS = [
    { text: 'Happy', emoji: '😊' },
    { text: 'Sad', emoji: '😢' },
    { text: 'Love', emoji: '😍' },
    { text: 'Energy', emoji: '⚡' },
];

export default function SearchScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();
    const [query, setQuery] = useState('');
    const { user: currentUser } = useMood();
    const [posts, setPosts] = useState<Post[]>([]);
    const [users, setUsers] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initial fetch of some posts to search through if needed, 
        // or we can fetch only on query. For now, let's fetch latest for suggestions.
        fetchInitialPosts();
    }, []);

    const fetchInitialPosts = async () => {
        try {
            const { posts: fetchedPosts } = await getPosts();
            setPosts(fetchedPosts);
            await fetchUsersForPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching initial search posts:", error);
        }
    };

    const fetchUsersForPosts = async (fetchedPosts: Post[]) => {
        const userIds = [...new Set(fetchedPosts.map(p => p.userId))];
        const newUsers: Record<string, UserProfile> = { ...users };
        let changed = false;

        for (const uid of userIds) {
            if (!newUsers[uid]) {
                const u = await getUserProfile(uid);
                if (u) {
                    newUsers[uid] = u;
                    changed = true;
                }
            }
        }
        if (changed) setUsers(newUsers);
    };

    // Filter posts based on query
    const results = query.trim() === '' ? [] : posts.filter(post =>
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.mood.toLowerCase().includes(query.toLowerCase())
    );

    const handleSuggestionPress = (text: string) => {
        setQuery(text);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
                    <SearchIcon size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Search emotions..."
                        placeholderTextColor={theme.textSecondary}
                        autoFocus
                        value={query}
                        onChangeText={setQuery}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <X size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                    <Text style={{ color: theme.text }}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {query.length === 0 ? (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Saved & Recent</Text>
                        <View style={styles.chipContainer}>
                            {SAVED_SEARCHES.map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                                    onPress={() => handleSuggestionPress(s)}
                                >
                                    <Clock size={14} color={theme.textSecondary} />
                                    <Text style={[styles.chipText, { color: theme.text }]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 25 }]}>Trending Emotions</Text>
                        <View style={styles.list}>
                            {SUGGESTIONS.map(s => (
                                <TouchableOpacity
                                    key={s.text}
                                    style={[styles.listItem, { borderBottomColor: theme.border }]}
                                    onPress={() => handleSuggestionPress(s.text)}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
                                        <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
                                    </View>
                                    <Text style={[styles.listText, { color: theme.text }]}>{s.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={{ paddingBottom: 50 }}>
                        {results.length === 0 ? (
                            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>No matching emotions found.</Text>
                        ) : (
                            results.map(post => {
                                const poster = users[post.userId];
                                const displayUser = poster ? {
                                    id: post.userId,
                                    username: poster.username,
                                    name: poster.username,
                                    handle: poster.isAnonymous ? 'Anonymous' : '@' + poster.username,
                                    avatar: poster.avatarUrl || null,
                                    avatarUrl: poster.avatarUrl || null,
                                    moodAura: poster.themeColor
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
                                    <View key={post.id} style={{ marginBottom: 10 }}>
                                        <PostCard post={post} user={displayUser as any} />
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 20,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 6,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    list: {
        marginTop: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 15,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listText: {
        fontSize: 16,
        fontWeight: '500',
    }
});
