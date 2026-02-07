
import { useAuth } from '@/context/AuthContext';
import { deleteStory, getActiveStories, markStoryAsViewed } from '@/services/storyService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { colors } from '@/theme/colors';
import { Story } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, User as UserIcon, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function StoryViewerScreen() {
    const { initialStoryId } = useLocalSearchParams<{ initialStoryId: string }>();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [stories, setStories] = useState<Story[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [users, setUsers] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            const fetchedStories = await getActiveStories();
            setStories(fetchedStories);

            // Preload Images
            fetchedStories.forEach((s: Story) => {
                if (s.type === 'image' && s.mediaUrl) {
                    Image.prefetch(s.mediaUrl);
                }
            });

            // Set initial index
            const idx = fetchedStories.findIndex((s: Story) => s.id === initialStoryId);
            if (idx !== -1) setCurrentIndex(idx);

            // User Fetching
            const userIds = [...new Set(fetchedStories.map((s: Story) => s.userId))];
            const uniqueIdsToFetch = userIds.filter(uid => !users[uid as string]);

            if (uniqueIdsToFetch.length > 0) {
                const userProfiles = await Promise.all(
                    uniqueIdsToFetch.map(uid => getUserProfile(uid as string))
                );

                const newUsers = { ...users };
                uniqueIdsToFetch.forEach((uid, i) => {
                    if (userProfiles[i]) {
                        newUsers[uid as string] = userProfiles[i]!;
                    }
                });
                setUsers(prev => ({ ...prev, ...newUsers }));
            }

            setLoading(false);
        };

        fetchStories();
    }, [initialStoryId]);

    // Mark as viewed when current index changes
    useEffect(() => {
        if (!loading && stories.length > 0 && currentUser) {
            const currentStory = stories[currentIndex];
            markStoryAsViewed(currentStory.id);
        }
    }, [currentIndex, loading, stories]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            router.back();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleDelete = () => {
        const story = stories[currentIndex];
        if (!story || story.userId !== currentUser?.uid) return;

        Alert.alert(
            "Delete Story",
            "Are you sure you want to delete this story?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteStory(story.id);
                            if (stories.length <= 1) {
                                router.back();
                            } else {
                                // Basic cleanup from list
                                setStories(prev => prev.filter(s => s.id !== story.id));
                                if (currentIndex >= stories.length - 1) {
                                    setCurrentIndex(Math.max(0, stories.length - 2));
                                }
                            }
                        } catch (error) {
                            Alert.alert("Error", "Could not delete story");
                        }
                    }
                }
            ]
        );
    };

    if (loading || stories.length === 0) {
        return <View style={[styles.container, { backgroundColor: '#000' }]} />;
    }

    const story = stories[currentIndex];
    const user = users[story.userId];

    // Static Mood Colors
    const moodColor = colors.calm; // Using calm sage for all story backgrounds for now or derive from mood

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Background Mood Gradient */}
            <LinearGradient
                colors={[moodColor, '#1a1a1a']}
                style={StyleSheet.absoluteFill}
            />

            {/* Media Content */}
            <View style={styles.contentArea}>
                {story.type === 'image' && story.mediaUrl ? (
                    <Image source={{ uri: story.mediaUrl }} style={styles.media} resizeMode="cover" />
                ) : (
                    <View style={styles.textContainer}>
                        <Text style={styles.storyText}>{story.text}</Text>
                    </View>
                )}
            </View>

            {/* Manual Navigation Tap Areas */}
            <View style={styles.tapContainer}>
                <TouchableOpacity style={styles.tapArea} onPress={handlePrev} />
                <TouchableOpacity style={styles.tapArea} onPress={handleNext} />
            </View>

            {/* Overlay UI */}
            <SafeAreaView style={styles.overlay}>
                {/* Progress Indicators (Static) */}
                <View style={styles.progressContainer}>
                    {stories.map((s, i) => (
                        <View key={s.id} style={[
                            styles.progressBar,
                            {
                                backgroundColor: i <= currentIndex ? 'white' : 'rgba(255,255,255,0.3)'
                            }
                        ]} />
                    ))}
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            {user?.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                            ) : (
                                <UserIcon color="white" size={20} />
                            )}
                        </View>
                        <Text style={styles.username}>{user?.username || 'Loading...'}</Text>
                        <Text style={styles.timeLabel}>
                            {new Date(story.createdAt).getHours()}:{String(new Date(story.createdAt).getMinutes()).padStart(2, '0')}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        {currentUser?.uid === story.userId && (
                            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                                <Trash2 color="white" size={20} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <X color="white" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: width,
        height: height,
    },
    textContainer: {
        padding: 40,
        alignItems: 'center',
    },
    storyText: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        textAlign: 'center',
    },
    tapContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
    },
    tapArea: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 10,
    },
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        gap: 4,
        marginBottom: 15,
    },
    progressBar: {
        flex: 1,
        height: 2,
        borderRadius: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        padding: 4,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
    },
    username: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    timeLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    }
});
