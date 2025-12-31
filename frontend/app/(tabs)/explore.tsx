import EmotionStories from '@/components/EmotionStories';
import MoodFilterBar from '@/components/MoodFilterBar';
import PostCard from '@/components/PostCard';
import TrendingAura from '@/components/TrendingAura';
import { useColorScheme } from '@/components/useColorScheme';
import { MoodType, THEME } from '@/constants/theme';
import { getPosts } from '@/services/postService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Post as PostType } from '@/types';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const [posts, setPosts] = useState<PostType[]>([]);
    const [users, setUsers] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { posts: fetchedPosts } = await getPosts(null, selectedMoods.length > 0 ? selectedMoods[0] : undefined);
            setPosts(fetchedPosts);

            // Fetch users
            const userIds = [...new Set(fetchedPosts.map((p: PostType) => p.userId))];
            const newUsers: Record<string, UserProfile> = { ...users };

            for (const uid of userIds) {
                if (!newUsers[uid as string]) {
                    const u = await getUserProfile(uid as string);
                    if (u) {
                        newUsers[uid as string] = u;
                    }
                }
            }
            setUsers(newUsers);
        } catch (error) {
            console.error("Error fetching explore posts:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [selectedMoods]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const toggleMood = (mood: MoodType) => {
        setSelectedMoods(prev => {
            if (prev.includes(mood)) return prev.filter(m => m !== mood);
            return [...prev, mood];
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={posts}
                keyExtractor={(item) => 'explore_' + item.id}
                renderItem={({ item }) => {
                    const postUser = users[item.userId];
                    const displayUser = postUser ? {
                        id: item.userId,
                        username: postUser.username,
                        name: postUser.username,
                        handle: postUser.isAnonymous ? 'Anonymous' : '@' + postUser.username,
                        avatar: postUser.avatarUrl || null,
                        avatarUrl: postUser.avatarUrl || null,
                        moodAura: postUser.themeColor
                    } : {
                        id: item.userId,
                        username: 'Loading...',
                        name: 'Loading...',
                        handle: '',
                        avatar: null,
                        avatarUrl: null,
                        moodAura: '#ccc'
                    };
                    return (
                        <View style={{ marginBottom: 10 }}>
                            <PostCard post={item} user={displayUser as any} />
                        </View>
                    );
                }}
                ListHeaderComponent={
                    <View style={{ paddingTop: 10 }}>
                        <EmotionStories />
                        <View style={{ paddingVertical: 10 }}>
                            <MoodFilterBar
                                selectedMoods={selectedMoods}
                                onToggleMood={toggleMood}
                                onClear={() => setSelectedMoods([])}
                            />
                        </View>
                        <TrendingAura />
                    </View>
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 100,
    },
});
