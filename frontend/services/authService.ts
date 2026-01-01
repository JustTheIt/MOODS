import api from "@/lib/api";
import { auth } from "@/lib/auth";
import {
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithCustomToken,
    signInWithEmailAndPassword,
    User
} from "firebase/auth";

// ============================================================================
// BACKEND AUTH FLOW (OTP)
// ============================================================================

export const registerUser = async (email: string, password: string, username: string, displayName: string, dateOfBirth: string) => {
    try {
        const response = await api.post('/auth/register', {
            email,
            password,
            username,
            displayName,
            dateOfBirth
        });
        return response.data;
    } catch (error: any) {
        console.error("Error registering user:", error);
        throw error.response?.data || error;
    }
};

export const verifyOTP = async (email: string, otp: string) => {
    try {
        const response = await api.post('/auth/verify-otp', { email, otp });

        // Backend returns a custom token for auto-login
        if (response.data.token) {
            await signInWithCustomToken(auth, response.data.token);
        }

        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

export const resendOTP = async (email: string) => {
    try {
        const response = await api.post('/auth/resend-otp', { email });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

// ============================================================================
// LEGACY / FIREBASE DIRECT FLOW
// ============================================================================

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const signOutUser = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (user) => {
        callback(user);
    });
};

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

/**
 * Send verification email to current user
 */
export const sendVerificationEmail = async (): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }

        await sendEmailVerification(user);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
};

/**
 * Check if current user's email is verified
 */
export const isEmailVerified = (): boolean => {
    return auth.currentUser?.emailVerified ?? false;
};

/**
 * Reload user to get latest verification status from Firebase
 */
export const reloadUser = async (): Promise<void> => {
    try {
        await auth.currentUser?.reload();
    } catch (error) {
        console.error("Error reloading user:", error);
        throw error;
    }
};

/**
 * Get current user's email address
 */
export const getCurrentUserEmail = (): string | null => {
    return auth.currentUser?.email ?? null;
};
