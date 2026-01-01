import { useColorScheme } from '@/components/useColorScheme';
import { auth } from '@/lib/auth';
import { isEmailVerified, reloadUser, resendOTP } from '@/services/authService';
import { useRouter } from 'expo-router';
import { Info, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const VerificationBanner = () => {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [resending, setResending] = useState(false);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const user = auth.currentUser;
                if (user && !user.emailVerified) {
                    // Double check by reloading
                    // Wrap in try-catch to ignore network/auth errors silently in background check
                    try {
                        await reloadUser();
                    } catch (e) {
                        // Ignore reload errors (e.g. network or invalid credential)
                    }

                    if (!isEmailVerified()) {
                        setVisible(true);
                    } else {
                        setVerified(true);
                    }
                } else if (user?.emailVerified) {
                    setVerified(true);
                }
            } catch (error) {
                console.log("Verification check skipped:", error);
            }
        };

        checkStatus();

        // Listen for token changes (verification status updates) to hide/show banner
        const { onIdTokenChanged } = require('firebase/auth');
        const unsubscribe = onIdTokenChanged(auth, (user: any) => {
            if (user && !user.emailVerified) {
                setVisible(true);
                setVerified(false);
            } else {
                setVisible(false);
                setVerified(!!user?.emailVerified);
            }
        });

        return unsubscribe;
    }, []);

    const handleResend = async () => {
        const user = auth.currentUser;
        if (!user || !user.email) return;

        try {
            setResending(true);
            const response = await resendOTP(user.email);
            alert(response.message || 'Verification code sent! Please check your email.');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to send code. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleVerifyNow = async () => {
        const user = auth.currentUser;
        if (!user || !user.email) return;

        // Trigger the code send in the background so navigation is instant
        resendOTP(user.email).catch(e => console.log("Background OTP send status:", e));

        router.push({
            pathname: '/(auth)/verify-email',
            params: { email: user.email }
        });
    };

    if (!visible || verified) return null;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: '#FFF9C4',
                borderBottomColor: '#FFF59D',
                paddingTop: insets.top // Respect status bar
            }
        ]}>
            <View style={styles.content}>
                <Info size={20} color="#F57F17" style={{ marginTop: 2 }} />
                <View style={styles.textContainer}>
                    <Text style={styles.text}>
                        Please verify your email to unlock all features.
                    </Text>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.actionButton}>
                            <Text style={styles.linkText}>
                                {resending ? 'Sending...' : 'Resend Code'}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.dot}>•</Text>
                        <TouchableOpacity onPress={handleVerifyNow} style={styles.actionButton}>
                            <Text style={styles.linkText}>Enter Code</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                    <X size={20} color="#F57F17" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderBottomWidth: 1,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        paddingHorizontal: 16,
        gap: 12,
        paddingBottom: 16, // Add some bottom padding
    },
    textContainer: {
        flex: 1,
        gap: 6,
    },
    text: {
        color: '#F57F17',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    actionButton: {
        paddingVertical: 4,
    },
    linkText: {
        color: '#E65100', // Darker orange for better contrast
        fontSize: 14,
        fontWeight: '700',
    },
    dot: {
        color: '#F57F17',
        fontSize: 14,
    },
    closeButton: {
        padding: 4,
        marginTop: -4,
        marginRight: -8,
    }
});
