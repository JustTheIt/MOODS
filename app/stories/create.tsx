import { MOOD_COLORS, MoodType, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import { createStory } from '@/services/storyService';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOODS: MoodType[] = ['happy', 'sad', 'calm', 'angry', 'love'];

export default function CreateStoryScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [selectedMood, setSelectedMood] = useState<MoodType>('happy');
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Updated to use array instead of enum
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission needed", "Camera permission is required to take photos.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleShare = async () => {
        if (!imageUri && !caption) {
            Alert.alert("Empty Story", "Please add an image or text to share your story.");
            return;
        }

        if (!user) return;

        setUploading(true);
        try {
            let mediaUrl = null;
            if (imageUri) {
                mediaUrl = await uploadToCloudinary(imageUri, 'mood/stories');
            }

            await createStory({
                userId: user.uid,
                type: imageUri ? 'image' : 'text',
                mediaUrl: mediaUrl || undefined,
                text: caption,
                mood: selectedMood,
            });

            Alert.alert("Success", "Your story has been shared!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Story upload error:", error);
            Alert.alert("Error", "Failed to share story. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const currentMoodColor = MOOD_COLORS[selectedMood].primary;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} disabled={uploading}>
                    <X color={theme.text} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>New Story</Text>
                <TouchableOpacity
                    style={[styles.postButton, { backgroundColor: currentMoodColor, opacity: uploading ? 0.6 : 1 }]}
                    onPress={handleShare}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.postButtonText}>Share</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Media Preview / Selection */}
                <View style={[styles.previewContainer, { borderColor: theme.border }]}>
                    {imageUri ? (
                        <>
                            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                            <TouchableOpacity
                                style={styles.removeImageBtn}
                                onPress={() => setImageUri(null)}
                                disabled={uploading}
                            >
                                <X color="white" size={16} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                                Share a moment
                            </Text>
                            <View style={styles.mediaButtons}>
                                <TouchableOpacity style={styles.mediaBtn} onPress={pickImage} disabled={uploading}>
                                    <ImageIcon color={currentMoodColor} size={32} />
                                    <Text style={[styles.mediaBtnText, { color: theme.text }]}>Gallery</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.mediaBtn} onPress={takePhoto} disabled={uploading}>
                                    <Camera color={currentMoodColor} size={32} />
                                    <Text style={[styles.mediaBtnText, { color: theme.text }]}>Camera</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Mood Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>How are you feeling?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
                        {MOODS.map((mood) => {
                            const isSelected = selectedMood === mood;
                            const color = MOOD_COLORS[mood];
                            return (
                                <TouchableOpacity
                                    key={mood}
                                    style={[
                                        styles.moodItem,
                                        isSelected && { borderColor: color.primary, borderWidth: 2, backgroundColor: color.secondary + '20' }
                                    ]}
                                    onPress={() => setSelectedMood(mood)}
                                    disabled={uploading}
                                >
                                    <LinearGradient
                                        colors={color.gradient}
                                        style={styles.moodDot}
                                    />
                                    <Text
                                        style={[
                                            styles.moodText,
                                            { color: isSelected ? color.primary : theme.textSecondary, fontWeight: isSelected ? '700' : '500' }
                                        ]}
                                    >
                                        {mood}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Caption Input */}
                <View style={styles.section}>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
                        placeholder="Add a caption..."
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                        maxLength={200}
                        editable={!uploading}
                    />
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    postButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    postButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    previewContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    removeImageBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20,
    },
    placeholderContainer: {
        alignItems: 'center',
        gap: 20,
    },
    placeholderText: {
        fontSize: 16,
        fontWeight: '500',
    },
    mediaButtons: {
        flexDirection: 'row',
        gap: 40,
    },
    mediaBtn: {
        alignItems: 'center',
        gap: 8,
    },
    mediaBtnText: {
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
    },
    moodScroll: {
        gap: 15,
        paddingVertical: 5,
    },
    moodItem: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'transparent',
        minWidth: 70,
    },
    moodDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 8,
    },
    moodText: {
        fontSize: 12,
        textTransform: 'capitalize',
    },
    input: {
        padding: 15,
        borderRadius: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
    }
});
