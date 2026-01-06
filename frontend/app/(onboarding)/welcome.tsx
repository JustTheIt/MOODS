import { HeartHandshakeImage } from '@/components/HeartHandshakeImage';
import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMood } from '@/context/MoodContext';
import { updateUserProfile } from '@/services/userService';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const { user } = useAuth();
    const { refreshUserProfile } = useMood();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    const handleSkip = async () => {
        if (!user) {
            router.replace('/home');
            return;
        }
        setLoading(true);
        try {
            await updateUserProfile(user.uid, {
                onboardingCompleted: true
            });
            await refreshUserProfile();
            router.replace('/home');
        } catch (error) {
            console.error("Skip error:", error);
            // Fallback
            router.replace('/home');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <HeartHandshakeImage size={100} color={THEME.primary} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Welcome to MOODS</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Your safe space to feel, share, and connect.
                </Text>

                <Text style={[styles.description, { color: theme.textSecondary }]}>
                    We believe in authentic expression without judgment. Let's make this space truly yours.
                </Text>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: THEME.primary }]}
                    onPress={() => router.push('/(onboarding)/personalize')}
                >
                    <Text style={styles.buttonText}>Personalize My Profile</Text>
                </TouchableOpacity>



                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    disabled={loading}
                >
                    <Text style={[styles.skipText, { color: theme.textSecondary }]}>
                        {loading ? 'Setting up...' : 'Skip for now'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 24,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    skipButton: {
        padding: 12,
    },
    skipText: {
        fontSize: 16,
    }
});
