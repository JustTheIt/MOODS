import { isEmailVerified, reloadUser, sendVerificationEmail, signOutUser, subscribeToAuthChanges } from '@/services/authService';
import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    authLoading: boolean;
    emailVerified: boolean;
    logout: () => Promise<void>;
    sendVerification: () => Promise<void>;
    checkVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    authLoading: true,
    emailVerified: false,
    logout: async () => { },
    sendVerification: async () => { },
    checkVerification: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [emailVerified, setEmailVerified] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((user) => {
            setUser(user);
            setEmailVerified(user?.emailVerified ?? false);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOutUser();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const sendVerification = async () => {
        await sendVerificationEmail();
    };

    const checkVerification = async () => {
        await reloadUser();
        const verified = isEmailVerified();
        setEmailVerified(verified);
        return verified;
    };

    return (
        <AuthContext.Provider value={{
            user,
            authLoading,
            emailVerified,
            logout,
            sendVerification,
            checkVerification
        }}>
            {children}
        </AuthContext.Provider>
    );
};
