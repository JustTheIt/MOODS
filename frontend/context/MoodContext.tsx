import { deleteMoodLogFromFirestore, getMoodHistory, logMoodToFirestore } from '@/services/moodService';
import { createUserProfile, getUserProfile } from '@/services/userService';
import { AppSettings, MoodLog, MoodType, User } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface MoodContextType {
    user: User;
    moodLogs: MoodLog[];
    settings: AppSettings;
    logMood: (mood: MoodLog) => void;
    deleteMoodLog: (id: string) => void;
    toggleSetting: (key: keyof AppSettings) => void;
    updateSettings: (key: keyof AppSettings, value: boolean | any) => void;
    refreshUserProfile: () => Promise<void>;
}

export const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User>({
        id: 'guest',
        username: 'Guest',
        name: 'Guest',
        displayName: 'Guest',
        email: '',
        handle: 'guest',
        avatar: 'https://via.placeholder.com/150',
        moodAura: '#ccc'
    });

    // Fetch real user profile
    useEffect(() => {
        if (authUser) {
            getUserProfile(authUser.uid).then(async (profile) => {
                if (profile) {
                    setUser({
                        id: authUser.uid,
                        username: profile.username,
                        name: profile.displayName || profile.username,
                        displayName: profile.displayName || profile.username,
                        email: profile.email || authUser.email || "",
                        handle: profile.isAnonymous ? 'Guest' : '@' + profile.username,
                        avatar: profile.avatarUrl || 'https://via.placeholder.com/150',
                        avatarUrl: profile.avatarUrl || 'https://via.placeholder.com/150',
                        moodAura: profile.themeColor,
                        themeColor: profile.themeColor,
                        dominantMood: profile.dominantMood as MoodType,
                        onboardingCompleted: profile.onboardingCompleted,
                        bio: profile.bio
                    });
                } else {
                    // Profile doesn't exist yet, attempt to create it (Self-healing)
                    console.log("User profile not found. Auto-creating profile for:", authUser.uid);
                    try {
                        const newProfile = await createUserProfile(authUser.uid, {
                            email: authUser.email || "",
                            username: authUser.email?.split('@')[0] || 'User',
                            isAnonymous: false
                        });

                        if (newProfile) {
                            setUser({
                                id: authUser.uid,
                                username: newProfile.username,
                                name: newProfile.username,
                                displayName: newProfile.username,
                                email: authUser.email || "",
                                handle: '@' + newProfile.username,
                                avatar: newProfile.avatarUrl || 'https://via.placeholder.com/150',
                                avatarUrl: newProfile.avatarUrl || 'https://via.placeholder.com/150',
                                moodAura: newProfile.themeColor || '#4ECDC4',
                                themeColor: newProfile.themeColor || '#4ECDC4',
                                dominantMood: newProfile.dominantMood as MoodType
                            });
                            console.log("Auto-created profile successfully.");
                        }
                    } catch (createError) {
                        console.error("Failed to auto-create user profile:", createError);
                        // Fallback to local guest state if creation fails
                        setUser({
                            id: authUser.uid,
                            username: authUser.email?.split('@')[0] || 'User',
                            name: authUser.email?.split('@')[0] || 'User',
                            displayName: authUser.email?.split('@')[0] || 'User',
                            email: authUser.email || "",
                            handle: '@' + (authUser.email?.split('@')[0] || 'user'),
                            avatar: 'https://via.placeholder.com/150',
                            moodAura: '#4ECDC4'
                        });
                    }
                }
            }).catch(error => {
                console.error('Error fetching user profile:', error);
                // On error, set a basic user profile
                setUser({
                    id: authUser.uid,
                    username: authUser.email?.split('@')[0] || 'User',
                    name: authUser.email?.split('@')[0] || 'User',
                    displayName: authUser.email?.split('@')[0] || 'User',
                    email: authUser.email || "",
                    handle: '@' + (authUser.email?.split('@')[0] || 'user'),
                    avatar: 'https://via.placeholder.com/150',
                    moodAura: '#4ECDC4'
                });
            });
        }
    }, [authUser]);

    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (authUser) {
                const logs = await getMoodHistory();
                setMoodLogs(logs);
            } else {
                setMoodLogs([]);
            }
        };
        fetchHistory();
    }, [authUser]);

    // Settings State
    const [settings, setSettings] = useState<AppSettings>({
        reduceMotion: false,
        glowIntensity: true,
        highContrast: false,
        themeMode: 'dark'
    });

    const logMood = async (newLog: MoodLog) => {
        if (!authUser) return;
        try {
            const log = await logMoodToFirestore({
                userId: authUser.uid,
                mood: newLog.mood,
                intensity: newLog.intensity,
                note: newLog.note
            });
            setMoodLogs(prev => [log, ...prev]);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteMoodLog = async (id: string) => {
        try {
            await deleteMoodLogFromFirestore(id);
            setMoodLogs(prev => prev.filter(log => log.id !== id));
        } catch (e) {
            console.error(e);
        }
    }

    const toggleSetting = (key: keyof AppSettings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const updateSettings = (key: keyof AppSettings, value: boolean | string) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    }

    const refreshUserProfile = async () => {
        if (!authUser) return;
        try {
            const profile = await getUserProfile(authUser.uid);
            if (profile) {
                setUser({
                    id: authUser.uid,
                    username: profile.username,
                    name: profile.displayName || profile.username, // Use displayName if available
                    displayName: profile.displayName || profile.username,
                    email: profile.email || authUser.email || "",
                    handle: profile.isAnonymous ? 'Guest' : '@' + profile.username,
                    avatar: profile.avatarUrl || 'https://via.placeholder.com/150',
                    avatarUrl: profile.avatarUrl || 'https://via.placeholder.com/150',
                    moodAura: profile.themeColor,
                    themeColor: profile.themeColor,
                    dominantMood: profile.dominantMood as MoodType,
                    onboardingCompleted: profile.onboardingCompleted, // Important
                    bio: profile.bio
                });
            }
        } catch (error) {
            console.error("Error refreshing user profile:", error);
        }
    };

    return (
        <MoodContext.Provider value={{
            user,
            moodLogs,
            settings,
            logMood,
            deleteMoodLog,
            toggleSetting,
            updateSettings,
            refreshUserProfile
        }}>
            {children}
        </MoodContext.Provider>
    );
}

export function useMood() {
    const context = useContext(MoodContext);
    if (context === undefined) {
        throw new Error('useMood must be used within a MoodProvider');
    }
    return context;
}
