import { MOOD_COLORS, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMood } from '@/context/MoodContext';
import { signOutUser } from '@/services/authService';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/userService';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, LogOut, Smile, Sparkles, User as UserIcon, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyProfileScreen() {
    const { user } = useAuth();
    const { moodLogs } = useMood();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const data = await getUserProfile(user!.uid);
            if (data) {
                setProfile(data);
                setUsername(data.username);
                setBio(data.bio || '');
                setAvatarUrl(data.avatarUrl || null);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

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
        setSaving(true);
        try {
            const result = await uploadToCloudinary(uri, 'mood/avatars');
            const uploadedUrl = result.url;
            setAvatarUrl(uploadedUrl);
            await updateUserProfile(user!.uid, { avatarUrl: uploadedUrl });
            Alert.alert("Success", "Profile picture updated!");
        } catch (error) {
            Alert.alert("Error", "Failed to upload image.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateUserProfile(user!.uid, {
                username,
                bio
            });
            setProfile(prev => prev ? { ...prev, username, bio } : null);
            setEditMode(false);
            Alert.alert("Success", "Profile updated!");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out", style: "destructive", onPress: async () => {
                        await signOutUser();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={MOOD_COLORS.happy.primary} />
            </View>
        );
    }

    const currentMood = profile?.dominantMood || 'calm';
    const moodColor = MOOD_COLORS[currentMood as keyof typeof MOOD_COLORS]?.primary || '#4ECDC4';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <X color={THEME.light.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <TouchableOpacity onPress={handleSignOut}>
                        <LogOut color="#FF6B6B" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Profile Section */}
                <View style={styles.profileInfo}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={saving}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <UserIcon color="#999" size={40} />
                            </View>
                        )}
                        <View style={[styles.cameraIcon, { backgroundColor: moodColor }]}>
                            <Camera color="white" size={16} />
                        </View>
                        {saving && (
                            <View style={styles.overlay}>
                                <ActivityIndicator color="white" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {editMode ? (
                        <View style={styles.editSection}>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Username"
                                placeholderTextColor="#999"
                            />
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about your vibe..."
                                placeholderTextColor="#999"
                                multiline
                            />
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditMode(false)}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: moodColor }]}
                                    onPress={handleSaveProfile}
                                    disabled={saving}
                                >
                                    <Text style={styles.saveText}>Save Changes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.viewSection}>
                            <Text style={styles.usernameText}>{profile?.username}</Text>
                            <Text style={styles.bioText}>{profile?.bio || "No bio yet. Tap edit to share your vibe!"}</Text>
                            <TouchableOpacity style={styles.editTrigger} onPress={() => setEditMode(true)}>
                                <Sparkles color={moodColor} size={16} />
                                <Text style={[styles.editText, { color: moodColor }]}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Emotional Summary Card */}
                <BlurView intensity={20} style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Smile color={moodColor} size={20} />
                        <Text style={styles.summaryTitle}>Emotional Summary</Text>
                    </View>
                    <View style={styles.summaryContent}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{moodLogs.length}</Text>
                            <Text style={styles.summaryLabel}>Mood Logs</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { textTransform: 'capitalize' }]}>{currentMood}</Text>
                            <Text style={styles.summaryLabel}>Dominant Mood</Text>
                        </View>
                    </View>
                </BlurView>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your History</Text>
                </View>

                {/* Empty state for history since we are just doing core logic */}
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Your mood history will appear here.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
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
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    placeholderAvatar: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewSection: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    usernameText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        marginBottom: 8,
    },
    bioText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 15,
    },
    editTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    editText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    editSection: {
        width: '100%',
        paddingHorizontal: 30,
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        fontSize: 16,
        color: '#333',
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 10,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    cancelText: {
        color: '#999',
        fontWeight: '600',
    },
    saveButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12,
    },
    saveText: {
        color: 'white',
        fontWeight: '700',
    },
    summaryCard: {
        margin: 20,
        padding: 20,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.02)',
        overflow: 'hidden',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginLeft: 10,
    },
    summaryContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
    }
});
