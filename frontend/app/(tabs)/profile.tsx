
import { Avatar } from '@/components/Avatar';
import { Divider } from '@/components/Divider';
import PostCard from '@/components/PostCard';
import { MoodType } from '@/constants/theme';
import { useMood } from '@/context/MoodContext';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import { findKindredSpirits } from '@/services/connectionService';
import { getUserPosts } from '@/services/postService';
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/userService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Post } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

export default function ProfileScreen() {
    const theme = useTheme();
    const { user, moodLogs } = useMood();
    const router = useRouter();

    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [kindredSpirits, setKindredSpirits] = useState<(UserProfile & { id: string })[]>([]);
    const [uploading, setUploading] = useState(false);
    const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.id && user.id !== 'guest') {
            getUserPosts(user.id).then(setUserPosts).catch(console.error);
        }
    }, [user]);

    // Find dominant mood
    const moodCounts: Record<string, number> = {};
    moodLogs.forEach(log => {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    });
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, 'happy') as MoodType;

    // Fetch Kindred Spirits
    useEffect(() => {
        if (user && user.id && user.id !== 'guest') {
            const fetchSpirits = async () => {
                const results = await findKindredSpirits(user.id, mostCommonMood);
                const spiritProfiles = await Promise.all(
                    results.map(async (res: any) => {
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
            const uploadResult = await uploadToCloudinary(uri, 'mood/avatars');
            const imageUrl = uploadResult.url;
            setLocalAvatarUrl(imageUrl);
            if (user && user.id && user.id !== 'guest') {
                await updateUserProfile(user.id, { avatarUrl: imageUrl });
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
    const connectionCount = kindredSpirits.length * 2 + 5;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.screenTitle, { color: theme.text }]}>Identity</Text>
                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Settings size={22} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={handlePickImage}
                        disabled={uploading}
                    >
                        <Avatar
                            uri={localAvatarUrl || user.avatar}
                            name={user.displayName || user.name}
                            size={80}
                        />
                        <View style={styles.editIcon}>
                            <Camera size={14} color="#FFF" />
                        </View>
                        {uploading && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator size="small" color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.profileInfo}>
                        <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
                        <Text style={[styles.handle, { color: theme.textSecondary }]}>{user.handle}</Text>
                        <Text style={[styles.moodStat, { color: colors.calm }]}>
                            Dominant: {mostCommonMood.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {user.bio && (
                    <Text style={[styles.bio, { color: theme.text }]}>{user.bio}</Text>
                )}

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.smallButton, { borderColor: theme.border }]}
                        onPress={() => router.push('/profile/edit')}
                    >
                        <Text style={[styles.smallButtonText, { color: theme.text }]}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                <Divider />

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{postCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Posts</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{connectionCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Connections</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{moodLogs.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Check-ins</Text>
                    </View>
                </View>

                <Divider />

                {/* Feed */}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Your Journey</Text>
                <View style={styles.feed}>
                    {userPosts.map(post => (
                        <PostCard key={post.id} post={post} user={user} flat />
                    ))}
                </View>

            </ScrollView>
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
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
    },
    screenTitle: {
        fontSize: 18,
        fontWeight: typography.semibold as any,
        letterSpacing: 0.5,
    },
    content: {
        paddingBottom: 40,
    },
    profileHeader: {
        flexDirection: 'row',
        padding: spacing.m,
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: spacing.m,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 20,
        fontWeight: typography.semibold as any,
        marginBottom: 2,
    },
    handle: {
        fontSize: 14,
        marginBottom: 4,
    },
    moodStat: {
        fontSize: 12,
        fontWeight: typography.semibold as any,
        letterSpacing: 0.5,
    },
    bio: {
        paddingHorizontal: spacing.m,
        paddingBottom: spacing.m,
        fontSize: 14,
        lineHeight: 20,
    },
    actionsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.m,
        paddingBottom: spacing.m,
        gap: 10,
    },
    smallButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderWidth: 1,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    smallButtonText: {
        fontSize: 12,
        fontWeight: typography.medium as any,
    },
    statsRow: {
        flexDirection: 'row',
        paddingVertical: spacing.m,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: typography.semibold as any,
    },
    statLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: typography.semibold as any,
        padding: spacing.m,
        paddingBottom: spacing.s,
    },
    feed: {
        // No extra padding
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.textPrimary,
        padding: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.background,
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
