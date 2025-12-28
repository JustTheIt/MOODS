import { MOOD_COLORS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { subscribeToActiveStories } from '@/services/storyService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Story } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function StoryBar() {
    const { user } = useAuth();
    const router = useRouter();
    const [stories, setStories] = useState<Story[]>([]);
    const [users, setUsers] = useState<Record<string, UserProfile>>({});

    useEffect(() => {
        const unsubscribe = subscribeToActiveStories((fetchedStories) => {
            setStories(fetchedStories);

            // Get unique user IDs
            const userIds = [...new Set(fetchedStories.map(s => s.userId))];
            userIds.forEach(async (uid) => {
                if (!users[uid]) {
                    const u = await getUserProfile(uid);
                    if (u) {
                        setUsers(prev => ({ ...prev, [uid]: u }));
                    }
                }
            });
        });

        return () => unsubscribe();
    }, []);

    // Group stories by user (showing only the latest story per user for the bar)
    const uniqueUserStories = stories.reduce((acc, story) => {
        if (!acc[story.userId] || story.createdAt > acc[story.userId].createdAt) {
            acc[story.userId] = story;
        }
        return acc;
    }, {} as Record<string, Story>);

    const storyUsers = Object.values(uniqueUserStories);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Create Story Button */}
                <TouchableOpacity
                    style={styles.storyItem}
                    onPress={() => router.push('/stories/create' as any)}
                >
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, styles.myAvatar]}>
                            <Plus color="#999" size={24} />
                        </View>
                        <View style={styles.addIcon}>
                            <Plus color="white" size={12} />
                        </View>
                    </View>
                    <Text style={styles.storyLabel}>My Story</Text>
                </TouchableOpacity>

                {/* Active Stories */}
                {storyUsers.map((story) => {
                    const poster = users[story.userId];
                    const moodColor = MOOD_COLORS[story.mood as keyof typeof MOOD_COLORS]?.primary || '#4ECDC4';

                    return (
                        <TouchableOpacity
                            key={story.id}
                            style={styles.storyItem}
                            onPress={() => router.push({
                                pathname: '/stories/viewer',
                                params: { initialStoryId: story.id } as any
                            })}
                        >
                            <View style={styles.avatarContainer}>
                                <LinearGradient
                                    colors={[moodColor, moodColor + '40']}
                                    style={styles.moodRing}
                                />
                                <View style={styles.avatarWrapper}>
                                    {poster?.avatarUrl ? (
                                        <Image source={{ uri: poster.avatarUrl }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatar, styles.placeholderAvatar]}>
                                            <Text style={styles.placeholderText}>
                                                {poster?.username?.charAt(0) || '?'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Text style={styles.storyLabel} numberOfLines={1}>
                                {poster?.username || 'Loading'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingHorizontal: 15,
        gap: 15,
    },
    storyItem: {
        alignItems: 'center',
        width: 70,
    },
    avatarContainer: {
        position: 'relative',
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fff',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
    },
    myAvatar: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
    },
    placeholderAvatar: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#999',
    },
    moodRing: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    addIcon: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#4ECDC4',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    storyLabel: {
        marginTop: 6,
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
        width: '100%',
        textAlign: 'center',
    }
});
