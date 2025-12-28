import EmotionStories from '@/components/EmotionStories';
import PostCard from '@/components/PostCard';
import TrendingAura from '@/components/TrendingAura';
import { THEME } from '@/constants/theme';
import { subscribeToPosts } from '@/services/postService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Post as PostType } from '@/types';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const [posts, setPosts] = useState<PostType[]>([]);
    const [users, setUsers] = useState<Record<string, UserProfile>>({});

    useEffect(() => {
        const unsubscribe = subscribeToPosts((fetchedPosts) => {
            setPosts(fetchedPosts);

            // Fetch users
            const userIds = [...new Set(fetchedPosts.map(p => p.userId))];
            userIds.forEach(async (uid) => {
                // checks inside
                const u = await getUserProfile(uid);
                if (u) {
                    setUsers(prev => ({ ...prev, [uid]: u }));
                }
            });
        });
        return () => unsubscribe();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={posts}
                keyExtractor={(item) => 'explore_' + item.id}
                renderItem={({ item }) => {
                    const postUser = users[item.userId];
                    const displayUser = postUser ? {
                        id: item.userId,
                        name: postUser.username,
                        handle: postUser.isAnonymous ? 'Anonymous' : '@' + postUser.username,
                        avatar: postUser.avatarUrl || 'https://via.placeholder.com/150',
                        moodAura: postUser.themeColor
                    } : {
                        id: item.userId,
                        name: 'Loading...',
                        handle: '',
                        avatar: 'https://via.placeholder.com/150',
                        moodAura: '#ccc'
                    };
                    return (
                        <View style={{ marginBottom: 10 }}>
                            <PostCard post={item} user={displayUser} />
                        </View>
                    );
                }}
                ListHeaderComponent={
                    <View>
                        <EmotionStories />
                        <TrendingAura />
                    </View>
                }
                contentContainerStyle={styles.listContent}
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
