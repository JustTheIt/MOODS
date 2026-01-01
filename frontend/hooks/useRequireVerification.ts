import { auth } from '@/lib/auth';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export const useRequireVerification = () => {
    const router = useRouter();
    const emailVerified = auth.currentUser?.emailVerified ?? false;

    const requireVerification = (action: () => void) => {
        // Double check specific user status
        const isVerified = auth.currentUser?.emailVerified;

        if (!isVerified) {
            Alert.alert(
                "Email Verification Required",
                "Please verify your email to use this feature. We'll send you a verification link.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Verify Now", onPress: () => router.push('/(auth)/verify-email') }
                ]
            );
            return;
        }

        // Execute the action if verified
        action();
    };

    return { requireVerification, emailVerified };
};
