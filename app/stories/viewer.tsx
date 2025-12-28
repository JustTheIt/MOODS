import { MOOD_COLORS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { deleteStory, markStoryAsViewed, subscribeToActiveStories } from '@/services/storyService';
import { getUserProfile, UserProfile } from '@/services/userService';
import { Story } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, User as UserIcon, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Animated as RNAnimated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewerScreen() {
    const { initialStoryId } = useLocalSearchParams<{ initialStoryId: string }>();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [stories, setStories] = useState<Story[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [users, setUsers] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);

    const progress = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        const unsubscribe = subscribeToActiveStories(async (fetchedStories) => {
            // Immediate update for responsiveness
            setStories(fetchedStories);

            // 1. Preload Images
            fetchedStories.forEach(s => {
                if (s.type === 'image' && s.mediaUrl) {
                    Image.prefetch(s.mediaUrl);
                }
            });

            // 2. Set initial index
            const idx = fetchedStories.findIndex(s => s.id === initialStoryId);
            if (idx !== -1) setCurrentIndex(idx);

            // 3. Optimized User Fetching
            const userIds = [...new Set(fetchedStories.map(s => s.userId))];
            const uniqueIdsToFetch = userIds.filter(uid => !users[uid]);

            if (uniqueIdsToFetch.length > 0) {
                const userProfiles = await Promise.all(
                    uniqueIdsToFetch.map(uid => getUserProfile(uid))
                );

                const newUsers = { ...users };
                uniqueIdsToFetch.forEach((uid, i) => {
                    if (userProfiles[i]) {
                        newUsers[uid] = userProfiles[i]!;
                    }
                });
                setUsers(prev => ({ ...prev, ...newUsers }));
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [initialStoryId]);

    // Mark as viewed when current index changes
    useEffect(() => {
        if (!loading && stories.length > 0 && currentUser) {
            const currentStory = stories[currentIndex];
            markStoryAsViewed(currentUser.uid, currentStory.id);
            startProgress();
        }
    }, [currentIndex, loading, stories]);

    const startProgress = () => {
        progress.setValue(0);
        RNAnimated.timing(progress, {
            toValue: 1,
            duration: STORY_DURATION,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                handleNext();
            }
        });
    };

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
        } else {
            setCurrentIndex(0);
            startProgress();
        }
    };

    const handleDelete = () => {
        const story = stories[currentIndex];
        if (!story || story.userId !== currentUser?.uid) return;

        progress.stopAnimation();

        Alert.alert(
            "Delete Story",
            "Are you sure you want to delete this story?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => startProgress() // Resume logic if needed
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteStory(story.id);
                            if (stories.length === 1) {
                                router.back();
                            } else {
                                // If it was the last store, go back, else show next/prev?
                                // Simplified: Firestore update will trigger re-render of stories list without this story
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
    const moodColor = MOOD_COLORS[story.mood as keyof typeof MOOD_COLORS]?.primary || '#4ECDC4';



    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Background Mood Gradient */}
            <LinearGradient
                colors={[moodColor, '#000']}
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

            {/* Tap Targets */}
            <View style={styles.tapContainer}>
                <TouchableOpacity style={styles.tapArea} onPress={handlePrev} />
                <TouchableOpacity style={styles.tapArea} onPress={handleNext} />
            </View>

            {/* Overlay UI */}
            <SafeAreaView style={styles.overlay} edges={['top']}>
                {/* Progress Bars */}
                <View style={styles.progressContainer}>
                    {stories.map((s, i) => (
                        <View key={s.id} style={styles.progressBarBg}>
                            <RNAnimated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: i === currentIndex
                                            ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                                            : i < currentIndex ? '100%' : '0%'
                                    }
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* User Info */}
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={[styles.avatarContainer, { borderColor: moodColor }]}>
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

import { SafeAreaView } from 'react-native-safe-area-context';

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
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
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
        gap: 5,
        marginBottom: 15,
    },
    progressBarBg: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 1,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconButton: {
        padding: 5,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    username: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    timeLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    closeButton: {
        padding: 5,
    }
});
