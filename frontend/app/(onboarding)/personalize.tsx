import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMood } from '@/context/MoodContext';
import { updateUserProfile } from '@/services/userService';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronRight, Globe, Lock, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = ['Identity', 'Preferences', 'First Mood'];

export default function PersonalizeScreen() {
    const { user } = useAuth();
    const { refreshUserProfile } = useMood();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form State
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState(''); // Just text input or placeholder for now
    const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

    const handleNext = async () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            // Complete
            if (!user) return;
            setLoading(true);
            try {
                await updateUserProfile(user.uid, {
                    bio,
                    gender: gender as any,
                    avatarUrl: avatarUrl || undefined, // Only send if set
                    privacy,
                    timezone,
                    onboardingCompleted: true
                });

                // Refresh local user state so _layout knows we are done
                await refreshUserProfile();

                router.replace('/home'); // Direct redirect to home
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Could not save profile.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSkip = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Mark onboarding as complete without saving extra details (or save defaults if needed)
            // [MODIFIED] Try to save what we have so far (Bio/Gender)
            await updateUserProfile(user.uid, {
                bio: bio || undefined,
                gender: gender as any || undefined,
                onboardingCompleted: true
            });

            await refreshUserProfile();
            router.replace('/home');
        } catch (error) {
            console.error("Skip error:", error);
            Alert.alert("Error", "Could not skip.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 0: // Identity
                return (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Who are you?</Text>
                        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                            Help us address you correctly and build a safe community.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Bio (Short & Sweet)</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                                placeholder="Hi, I'm..."
                                placeholderTextColor={theme.textSecondary}
                                multiline
                                numberOfLines={3}
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>

                        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 20 }]}>Gender Identity (Optional)</Text>
                        <View style={styles.optionsGrid}>
                            {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor: gender === option ? THEME.primary : theme.card,
                                            borderColor: theme.border
                                        }
                                    ]}
                                    onPress={() => setGender(option)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        { color: gender === option ? '#FFF' : theme.text }
                                    ]}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            case 1: // Preferences
                return (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Your Privacy</Text>
                        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                            Control who sees your moods. You can change this anytime.
                        </Text>

                        <TouchableOpacity
                            style={[styles.prefCard, {
                                backgroundColor: theme.card,
                                borderColor: privacy === 'public' ? THEME.primary : theme.border,
                                borderWidth: privacy === 'public' ? 2 : 1
                            }]}
                            onPress={() => setPrivacy('public')}
                        >
                            <Globe color={privacy === 'public' ? THEME.primary : theme.textSecondary} size={24} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.prefTitle, { color: theme.text }]}>Public</Text>
                                <Text style={[styles.prefDesc, { color: theme.textSecondary }]}>Anyone can see your public posts.</Text>
                            </View>
                            {privacy === 'public' && <Check color={THEME.primary} size={20} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.prefCard, {
                                backgroundColor: theme.card,
                                borderColor: privacy === 'friends' ? THEME.primary : theme.border,
                                borderWidth: privacy === 'friends' ? 2 : 1
                            }]}
                            onPress={() => setPrivacy('friends')}
                        >
                            <User color={privacy === 'friends' ? THEME.primary : theme.textSecondary} size={24} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.prefTitle, { color: theme.text }]}>Friends Only</Text>
                                <Text style={[styles.prefDesc, { color: theme.textSecondary }]}>Only followers can see your posts.</Text>
                            </View>
                            {privacy === 'friends' && <Check color={THEME.primary} size={20} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.prefCard, {
                                backgroundColor: theme.card,
                                borderColor: privacy === 'private' ? THEME.primary : theme.border,
                                borderWidth: privacy === 'private' ? 2 : 1
                            }]}
                            onPress={() => setPrivacy('private')}
                        >
                            <Lock color={privacy === 'private' ? THEME.primary : theme.textSecondary} size={24} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.prefTitle, { color: theme.text }]}>Private</Text>
                                <Text style={[styles.prefDesc, { color: theme.textSecondary }]}>Only you can see your posts.</Text>
                            </View>
                            {privacy === 'private' && <Check color={THEME.primary} size={20} />}
                        </TouchableOpacity>
                    </View>
                );
            case 2: // Confirmation (First Mood skipped for simplicity here, can join in logic)
                return (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Almost Done!</Text>
                        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                            You are all set to start your journey.
                        </Text>
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Check size={80} color={THEME.primary} />
                            <Text style={{ color: theme.text, fontSize: 18, marginTop: 20 }}>Ready to launch?</Text>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ArrowLeft color={theme.text} size={24} />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    {STEPS.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                { backgroundColor: i <= step ? THEME.primary : theme.border }
                            ]}
                        />
                    ))}
                </View>
                <TouchableOpacity onPress={handleSkip} disabled={loading}>
                    <Text style={{ color: theme.textSecondary, fontSize: 16, fontWeight: '600' }}>Skip</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {renderStepContent()}
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: THEME.primary }]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Text style={styles.nextButtonText}>
                                {step === STEPS.length - 1 ? 'Finish' : 'Continue'}
                            </Text>
                            <ChevronRight color="#FFF" size={20} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 8,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    stepDesc: {
        fontSize: 16,
        marginBottom: 32,
        lineHeight: 22,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        height: 100,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    optionText: {
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    nextButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    prefCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        gap: 16,
    },
    prefTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    prefDesc: {
        fontSize: 13,
    }
});
