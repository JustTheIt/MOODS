import PostCard from '@/components/PostCard';
import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { useMood } from '@/context/MoodContext';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import { findKindredSpirits } from '@/services/connectionService';
import { subscribeToUserPosts } from '@/services/postService';
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/userService';
import { Post } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Camera, Settings, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const { user, moodLogs } = useMood();
    const router = useRouter();

    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [kindredSpirits, setKindredSpirits] = useState<(UserProfile & { id: string })[]>([]);
    const [uploading, setUploading] = useState(false);
    const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.id && user.id !== 'guest') {
            const unsubscribe = subscribeToUserPosts(user.id, (fetchedPosts) => {
                setUserPosts(fetchedPosts);
            });
            return () => unsubscribe();
        }
    }, [user]);

    // Find dominant mood
    const moodCounts: Record<string, number> = {};
    moodLogs.forEach(log => {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    });
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, 'happy') as MoodType;
    const moodColor = MOOD_COLORS[mostCommonMood] || MOOD_COLORS.happy;

    // Fetch Kindred Spirits
    useEffect(() => {
        if (user && user.id && user.id !== 'guest') {
            const fetchSpirits = async () => {
                const results = await findKindredSpirits(user.id, mostCommonMood);
                const spiritProfiles = await Promise.all(
                    results.map(async (res) => {
                        const profile = await getUserProfile(res.userId);
                        return profile ? { ...profile, id: res.userId } : null;
                    })
                );
                setKindredSpirits(spiritProfiles.filter(p => p !== null) as (UserProfile & { id: string })[]);
            };
            fetchSpirits();
        }
    }, [user, mostCommonMood]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        setUploading(true);
        try {
            const uploadedUrl = await uploadToCloudinary(uri, 'mood/avatars');
            setLocalAvatarUrl(uploadedUrl);
            if (user && user.id && user.id !== 'guest') {
                await updateUserProfile(user.id, { avatarUrl: uploadedUrl });
                Alert.alert("Success", "Profile picture updated!");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload image.");
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const postCount = userPosts.length;
    const connectionCount = kindredSpirits.length * 2 + 5; // Simulating some activity based on real spirits

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Identity</Text>
                    <TouchableOpacity onPress={() => router.push('/settings')}>
                        <Settings size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileSection}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={handlePickImage}
                        disabled={uploading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={moodColor.gradient}
                            style={styles.avatarAura}
                        />
                        <Image source={{ uri: localAvatarUrl || user.avatar }} style={styles.avatar} />
                        <View style={[styles.cameraIconOverlay, { backgroundColor: moodColor.primary }]}>
                            <Camera size={18} color="#FFF" />
                        </View>
                        {uploading && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator size="large" color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
                    <Text style={[styles.handle, { color: theme.textSecondary }]}>{user.handle}</Text>

                    <View style={[styles.moodBadge, { backgroundColor: moodColor.secondary }]}>
                        <Text style={[styles.moodBadgeText, { color: moodColor.text }]}>Dominant Aura: {mostCommonMood} ✨</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{postCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Posts</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{connectionCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Connections</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{moodLogs.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Check-ins</Text>
                    </View>
                </View>

                {/* Connections (Kindred Spirits) */}
                <View style={{ marginBottom: 25 }}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 10 }]}>Kindred Spirits</Text>
                    {kindredSpirits.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}>
                            {kindredSpirits.map((spirit) => (
                                <View key={spirit.id} style={{ alignItems: 'center', gap: 5 }}>
                                    <View style={{ padding: 2, borderRadius: 24, borderWidth: 1, borderColor: moodColor.primary }}>
                                        <Image
                                            source={{ uri: spirit.avatarUrl || 'https://i.pravatar.cc/150' }}
                                            style={{ width: 44, height: 44, borderRadius: 22 }}
                                        />
                                    </View>
                                    <Text style={{ fontSize: 10, color: theme.textSecondary }}>{spirit.username}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={{ paddingHorizontal: 20 }}>
                            <Text style={{ color: theme.textSecondary, fontSize: 13, fontStyle: 'italic' }}>Share more moods to find people with similar vibrations.</Text>
                        </View>
                    )}
                </View>

                {/* Emotional ID Card (V2 Feature) */}
                <View style={[styles.idCard, { backgroundColor: theme.card }]}>
                    <View style={styles.idHeader}>
                        <Zap size={20} color={theme.text} />
                        <Text style={[styles.idTitle, { color: theme.text }]}>Emotional Rhythm</Text>
                    </View>
                    <Text style={{ color: theme.textSecondary, marginBottom: 10 }}>You tend to feel energetic in the mornings.</Text>
                    <View style={styles.rhythmVisual}>
                        <View style={[styles.bar, { height: 20, backgroundColor: theme.border }]} />
                        <View style={[styles.bar, { height: 40, backgroundColor: MOOD_COLORS.happy.primary }]} />
                        <View style={[styles.bar, { height: 30, backgroundColor: MOOD_COLORS.calm.primary }]} />
                        <View style={[styles.bar, { height: 15, backgroundColor: theme.border }]} />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Journey</Text>
                {userPosts.map(post => (
                    <PostCard key={post.id} post={post} user={user} />
                ))}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarAura: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        opacity: 0.6,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    handle: {
        fontSize: 14,
        marginBottom: 10,
    },
    moodBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    moodBadgeText: {
        fontWeight: '600',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 25,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
    },
    divider: {
        width: 1,
        height: 30,
    },
    idCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
    },
    idHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    idTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    rhythmVisual: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 50,
        gap: 5,
    },
    bar: {
        flex: 1,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 15,
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
