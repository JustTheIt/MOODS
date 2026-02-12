import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRequireVerification } from '@/hooks/useRequireVerification';
import { createPost } from '@/services/postService';
import { analyzeMood } from '@/services/sentimentService';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Camera, Video, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// moods adjusted to match MoodType
const MOODS: MoodType[] = ['happy', 'sad', 'angry', 'love', 'calm', 'anxious', 'tired'];

export default function NewPostScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();
    const { user } = useAuth();
    const { requireVerification } = useRequireVerification();

    const [selectedMood, setSelectedMood] = useState<MoodType>('happy');
    const [content, setContent] = useState('');
    const [intensity, setIntensity] = useState(0.5);
    const [media, setMedia] = useState<{ uri: string, type: 'image' | 'video' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [suggestedMood, setSuggestedMood] = useState<MoodType | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (content.trim().length > 3) {
                setAnalyzing(true);
                const mood = await analyzeMood(content);
                if (mood) {
                    setSelectedMood(mood as MoodType);
                    setSuggestedMood(mood as MoodType);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                setAnalyzing(false);
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timer);
    }, [content]);

    const player = useVideoPlayer(media?.type === 'video' ? media.uri : null, (player) => {
        player.loop = true;
        player.play();
    });

    const pickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setMedia({
                uri: result.assets[0].uri,
                type: result.assets[0].type === 'video' ? 'video' : 'image'
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const handlePost = () => {
        if (!content.trim() || !user) return;

        requireVerification(async () => {
            setLoading(true);
            try {
                await createPost({
                    userId: user.uid,
                    content: content,
                    mood: selectedMood,
                    intensity: intensity,
                    suggestedMood: suggestedMood,
                    anonymous: user.isAnonymous ?? false,
                }, media || undefined);

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.back();
            } catch (error: any) {
                console.error("Failed to post:", error);
                Alert.alert("Post Failed", error.message || "Failed to create post. Please try again.");
            } finally {
                setLoading(false);
            }
        });
    };

    const handleIntensitySelect = (val: number) => {
        setIntensity(val);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <X size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>New Post</Text>
                <TouchableOpacity onPress={handlePost} disabled={!content.trim() || loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={MOOD_COLORS[selectedMood].primary} />
                    ) : (
                        <Text style={[styles.postButton, { color: content.trim() ? MOOD_COLORS[selectedMood].primary : theme.textSecondary }]}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 }}>
                    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>How are you feeling?</Text>
                    {analyzing && <ActivityIndicator size="small" color={theme.textSecondary} />}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodSelector} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {MOODS.map((mood) => {
                        const isSelected = selectedMood === mood;
                        const mColor = MOOD_COLORS[mood] || MOOD_COLORS.happy;
                        return (
                            <TouchableOpacity
                                key={mood}
                                style={[
                                    styles.moodChip,
                                    {
                                        backgroundColor: isSelected ? mColor.primary : theme.card,
                                        borderColor: mColor.primary,
                                        borderWidth: 1
                                    }
                                ]}
                                onPress={() => {
                                    setSelectedMood(mood);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <Text style={[styles.moodText, { color: isSelected ? '#FFF' : theme.text }]}>
                                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>

                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Intensity: {intensity < 0.3 ? 'Mild' : intensity < 0.7 ? 'Moderate' : 'Deep'}</Text>
                <View style={styles.intensityContainer}>
                    <View style={[styles.intensityTrack, { backgroundColor: theme.border }]}>
                        <View style={[styles.intensityFill, { width: `${intensity * 100}%`, backgroundColor: MOOD_COLORS[selectedMood].primary }]} />
                    </View>
                    <View style={styles.intensityButtons}>
                        <TouchableOpacity onPress={() => handleIntensitySelect(0.2)} style={styles.intensityHitOptions}><Text style={{ fontSize: 20 }}>☁️</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleIntensitySelect(0.5)} style={styles.intensityHitOptions}><Text style={{ fontSize: 20 }}>🌤️</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleIntensitySelect(0.9)} style={styles.intensityHitOptions}><Text style={{ fontSize: 20 }}>🔥</Text></TouchableOpacity>
                    </View>
                </View>

                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Share your feelings..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    textAlignVertical="top"
                />

                {media && (
                    <View style={styles.imagePreviewContainer}>
                        {media.type === 'video' ? (
                            <VideoView
                                style={styles.imagePreview}
                                player={player}
                                allowsFullscreen
                                allowsPictureInPicture
                            />
                        ) : (
                            <Image
                                source={{ uri: media.uri }}
                                style={styles.imagePreview}
                                contentFit="cover"
                                transition={200}
                            />
                        )}
                        <TouchableOpacity
                            style={[styles.removeImage, { backgroundColor: theme.card }]}
                            onPress={() => setMedia(null)}
                        >
                            <X size={16} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.attachButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={pickMedia}
                >
                    {media?.type === 'video' ? <Video size={20} color={theme.textSecondary} /> : <Camera size={20} color={theme.textSecondary} />}
                    <Text style={[styles.attachText, { color: theme.textSecondary }]}>
                        {media ? (media.type === 'video' ? 'Change Video' : 'Change Photo') : 'Add Media'}
                    </Text>
                </TouchableOpacity>
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
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    postButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        paddingBottom: 40,
    },
    sectionLabel: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    moodSelector: {
        flexGrow: 0,
        marginBottom: 20,
    },
    moodChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    moodText: {
        fontWeight: '500',
    },
    intensityContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    intensityTrack: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        marginBottom: 10,
        overflow: 'hidden',
    },
    intensityFill: {
        height: '100%',
    },
    intensityButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    intensityHitOptions: {
        padding: 10,
    },
    input: {
        padding: 20,
        fontSize: 18,
        minHeight: 150,
    },
    attachButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 8,
        justifyContent: 'center',
        marginTop: 10,
    },
    attachText: {
        fontSize: 15,
        fontWeight: '500',
    },
    imagePreviewContainer: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        aspectRatio: 1, // Enforce square preview
    },
    removeImage: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    }
});
