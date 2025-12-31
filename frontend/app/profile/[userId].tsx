import { Avatar } from '@/components/Avatar';
import PostCard from '@/components/PostCard';
import { MOOD_COLORS, THEME } from '@/constants/theme';
import { getUserPosts } from '@/services/postService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Post } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PublicProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]);

    const fetchData = async () => {
        try {
            // Fetch profile
            const profileData = await getUserProfile(userId);
            if (profileData) {
                setProfile(profileData);
            }

            // Fetch posts (non-anonymous only)
            const fetchedPosts = await getUserPosts(userId);
            // Filter out anonymous posts for public profile
            const publicPosts = fetchedPosts.filter((p: Post) => !p.anonymous);
            setPosts(publicPosts);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching public profile:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={MOOD_COLORS.happy.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: theme.text }}>User not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: MOOD_COLORS.happy.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const moodColor = MOOD_COLORS[profile.dominantMood as keyof typeof MOOD_COLORS]?.primary || '#4ECDC4';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft color={theme.text} size={28} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            uri={profile.avatarUrl}
                            name={profile.username}
                            size={110}
                        />
                        <View style={[styles.moodRing, { borderColor: moodColor }]} />
                    </View>

                    <Text style={[styles.usernameText, { color: theme.text }]}>{profile.username}</Text>
                    {!!profile.bio && (
                        <Text style={[styles.bioText, { color: theme.textSecondary }]}>{profile.bio}</Text>
                    )}

                    <View style={[styles.moodBadge, { backgroundColor: moodColor + '20' }]}>
                        <Sparkles color={moodColor} size={14} />
                        <Text style={[styles.moodBadgeText, { color: moodColor }]}>
                            {(profile.dominantMood || 'happy').charAt(0).toUpperCase() + (profile.dominantMood || 'happy').slice(1)} Aura
                        </Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{posts.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Posts</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Vibes</Text>
                    </View>
                </View>

                <View style={styles.postsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Shared Moments</Text>
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard key={post.id} post={post} user={profile as any} />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No public posts yet.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    profileInfo: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    moodRing: {
        position: 'absolute',
        top: -5,
        left: -5,
        right: -5,
        bottom: -5,
        borderRadius: 65,
        borderWidth: 3,
    },
    usernameText: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    bioText: {
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 22,
        marginBottom: 15,
    },
    moodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    moodBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 30,
        gap: 40,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
    },
    postsSection: {
        paddingHorizontal: 15,
        paddingBottom: 50,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 15,
        marginLeft: 5,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    }
});
