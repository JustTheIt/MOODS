
import MoodFilterBar from '@/components/MoodFilterBar';
import PostCard from '@/components/PostCard';
import { MoodType } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTheme } from '@/hooks/useTheme';
import { getPosts } from '@/services/postService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { spacing } from '@/theme/spacing';
import { Post as PostType } from '@/types';
import { router } from 'expo-router';
import { Bell, Plus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const theme = useTheme(); // Use consistent theme hook
  const [posts, setPosts] = useState<PostType[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user: authUser, authLoading } = useAuth();
  const { unreadCount } = useNotifications();

  // Filtering Logic
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);

  const fetchPosts = useCallback(async () => {
    if (authLoading) return;

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
  }, [authLoading, selectedMoods, users]);

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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* 2. Safe Area Handling (TOP ONLY) */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>MOODS</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={styles.iconButton}
            >
              <Bell size={24} color={theme.text} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
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
        {/* 3. Visual Separation - Static Divider handled by borderBottomWidth above */}
      </SafeAreaView>

      <View style={{ flex: 1 }}>
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
                {authLoading || loading ? 'Fetching moods...' : 'No moods found matching this filter.'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1, // Static divider
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  filters: {
    paddingVertical: spacing.s,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
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
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
