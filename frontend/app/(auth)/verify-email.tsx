import { useColorScheme } from '@/components/useColorScheme';
import { THEME } from '@/constants/theme';
import { useMood } from '@/context/MoodContext';
import { auth } from '@/lib/auth';
import { reloadUser, resendOTP, verifyOTP } from '@/services/authService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Mail, RefreshCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyEmailScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? THEME.dark : THEME.light;
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user, refreshUserProfile } = useMood();

    const email = Array.isArray(params.email) ? params.email[0] : params.email || '';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (!email) {
            // If they are logged in, we can fallback to their actual email if missing from params
            if (user?.email) {
                // This is fine, we'll use user.email
            } else {
                Alert.alert("Error", "Email address missing. Please register again.", [
                    { text: "Go Back", onPress: () => router.replace('/(auth)/register') }
                ]);
            }
        }
    }, [email, user]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setResendDisabled(false);
        }
    }, [countdown]);

    const handleVerify = async () => {
        const targetEmail = email || user?.email;
        if (!targetEmail) return;

        if (otp.length !== 6) {
            Alert.alert("Error", "Please enter the 6-digit code.");
            return;
        }

        setLoading(true);
        try {
            await verifyOTP(targetEmail, otp);

            // IMPORTANT: Force Firebase to reload user state & refresh token claims
            // This ensures all backend checks (emailVerified) pass immediately
            await reloadUser();
            await auth.currentUser?.getIdToken(true); // Force token refresh

            await refreshUserProfile(); // Sync Firestore profile state

            Alert.alert(
                "Verified! 🎉",
                "Your email has been verified. Welcome to MOODS!",
                [
                    {
                        text: "Let's Go",
                        onPress: () => {
                            if (user?.onboardingCompleted) {
                                router.replace('/home');
                            } else {
                                router.replace('/(onboarding)/welcome');
                            }
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error("Verification error:", error);
            Alert.alert("Verification Failed", error.message || "Invalid code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        const targetEmail = email || user?.email;
        if (!targetEmail) return;

        setLoading(true);
        try {
            const response = await resendOTP(targetEmail);
            setResendDisabled(true);
            setCountdown(60);
            Alert.alert("Code Sent", response.message || "A new verification code has been sent to your email.");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to resend code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.content}>
                        <View style={[styles.iconContainer, { backgroundColor: THEME.primary + '20' }]}>
                            <Mail size={48} color={THEME.primary} />
                        </View>

                        <Text style={[styles.title, { color: theme.text }]}>
                            Enter Verification Code
                        </Text>

                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            We sent a 6-digit code to:
                        </Text>
                        <Text style={[styles.emailText, { color: THEME.primary }]}>
                            {email || user?.email || 'your email'}
                        </Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    styles.otpInput,
                                    {
                                        backgroundColor: theme.card,
                                        color: theme.text,
                                        borderColor: theme.border
                                    }
                                ]}
                                placeholder="000000"
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="number-pad"
                                maxLength={6}
                                value={otp}
                                onChangeText={setOtp}
                                autoFocus={true}
                            />
                            <Text style={{ color: theme.textSecondary, marginTop: 12, fontSize: 13 }}>
                                Enter the 6-digit code from your email
                            </Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    { backgroundColor: THEME.primary, opacity: otp.length !== 6 || loading ? 0.7 : 1 }
                                ]}
                                onPress={handleVerify}
                                disabled={otp.length !== 6 || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.primaryButtonText}>Verify Code</Text>
                                        <Check size={20} color="#FFF" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.resendButton, { opacity: resendDisabled ? 0.5 : 1 }]}
                                onPress={handleResend}
                                disabled={loading || resendDisabled}
                            >
                                <RefreshCw size={16} color={theme.textSecondary} />
                                <Text style={[styles.resendText, { color: theme.textSecondary }]}>
                                    {resendDisabled ? `Resend code in ${countdown}s` : "Resend Code"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    emailText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 32,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
    },
    otpInput: {
        width: '100%',
        height: 64,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 8,
        borderWidth: 1,
        borderRadius: 12,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: 12,
    },
    resendText: {
        fontSize: 15,
        fontWeight: '600',
    },
    helpText: {
        fontSize: 13,
        marginTop: 20,
        textAlign: 'center',
    },
});
