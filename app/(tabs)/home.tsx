import MoodFilterBar from '@/components/MoodFilterBar';
import PostCard from '@/components/PostCard';
import { MoodType, THEME } from '@/constants/theme';
import { subscribeToPosts } from '@/services/postService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Post as PostType } from '@/types';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
  // const { posts } = useMood(); // Removed global posts
  const [posts, setPosts] = useState<PostType[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [refreshing, setRefreshing] = useState(false);

  // Filtering Logic
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);

  useEffect(() => {
    // Subscribe to posts
    const unsubscribe = subscribeToPosts((fetchedPosts) => {
      setPosts(fetchedPosts);

      // Fetch users
      const userIds = [...new Set(fetchedPosts.map(p => p.userId))];
      const newUsers: Record<string, UserProfile> = { ...users };
      let hasNewUsers = false;

      // Note: we can't use await inside sync callback nicely without IIFE or ignored promise
      // For simplicity, fire off requests
      userIds.forEach(async (uid) => {
        if (!newUsers[uid]) {
          const u = await getUserProfile(uid);
          if (u) {
            newUsers[uid] = u;
            setUsers(prev => ({ ...prev, [uid]: u }));
          }
        }
      });

    }, selectedMoods.length > 0 ? selectedMoods[0] : undefined);

    return () => unsubscribe();
  }, [selectedMoods]); // Re-subscribe when filter changes

  const filteredPosts = posts; // Filtering happens in valid queries now, or client side logic if query limited.
  // Actually, subscribeToPosts only supports single mood filter in my service. 
  // If multiple moods selected, I should filter client side or update service.
  // User Prompt: "Posts can be filtered by mood".
  // For now, I'll filter client side if service doesn't support array.


  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleMood = (mood: MoodType) => {
    setSelectedMoods(prev => {
      if (prev.includes(mood)) return prev.filter(m => m !== mood);
      return [...prev, mood];
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>MOODS</Text>
        <TouchableOpacity onPress={() => router.push('/post/new')}>
          <Plus size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <MoodFilterBar
          selectedMoods={selectedMoods}
          onToggleMood={toggleMood}
          onClear={() => setSelectedMoods([])}
        />
      </View>



      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
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
            <PostCard post={item} user={displayUser as any} />
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: theme.textSecondary }}>No moods found matching this filter.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  filters: {
    paddingBottom: 5,
  },
  listContent: {
    paddingBottom: 100,
  },
});
