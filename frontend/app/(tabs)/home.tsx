import MoodFilterBar from '@/components/MoodFilterBar';
import PostCard from '@/components/PostCard';
import { useColorScheme } from '@/components/useColorScheme';
import { MoodType, THEME } from '@/constants/theme';
import { useNotifications } from '@/context/NotificationContext';
import { getPosts } from '@/services/postService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Post as PostType } from '@/types';
import { router } from 'expo-router';
import { Bell, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
  const [posts, setPosts] = useState<PostType[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { unreadCount } = useNotifications();

  // Filtering Logic
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
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedMoods]); // Re-fetch when filter changes

  const filteredPosts = posts;

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>MOODS</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={styles.iconButton}
          >
            <Bell size={24} color={theme.text} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: '#FF6B6B' }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/post/new')}
            style={styles.iconButton}
          >
            <Plus size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
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
            username: postUser.username,
            name: postUser.username,
            handle: postUser.isAnonymous ? 'Anonymous' : '@' + postUser.username,
            avatar: postUser.avatarUrl || 'https://via.placeholder.com/150',
            avatarUrl: postUser.avatarUrl || 'https://via.placeholder.com/150',
            moodAura: postUser.themeColor
          } : {
            id: item.userId,
            username: 'Loading...',
            name: 'Loading...',
            handle: '',
            avatar: 'https://via.placeholder.com/150',
            avatarUrl: 'https://via.placeholder.com/150',
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
            <Text style={{ color: theme.textSecondary }}>
              {loading ? 'Fetching moods...' : 'No moods found matching this filter.'}
            </Text>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
