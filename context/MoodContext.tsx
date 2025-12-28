import { deleteMoodLogFromFirestore, logMoodToFirestore, subscribeToMoodHistory } from '@/services/moodService';
import { getUserProfile } from '@/services/userService';
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
    updateSettings: (key: keyof AppSettings, value: boolean) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User>({
        id: 'guest',
        username: 'Guest',
        name: 'Guest',
        handle: 'guest',
        avatar: 'https://via.placeholder.com/150',
        moodAura: '#ccc'
    });

    // Fetch real user profile
    useEffect(() => {
        if (authUser) {
            getUserProfile(authUser.uid).then(profile => {
                if (profile) {
                    setUser({
                        id: authUser.uid,
                        username: profile.username,
                        name: profile.username,
                        handle: profile.isAnonymous ? 'Guest' : '@' + profile.username,
                        avatar: profile.avatarUrl || 'https://via.placeholder.com/150',
                        avatarUrl: profile.avatarUrl || 'https://via.placeholder.com/150',
                        moodAura: profile.themeColor,
                        themeColor: profile.themeColor,
                        dominantMood: profile.dominantMood as MoodType
                    });
                }
            });
        }
    }, [authUser]);

    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);

    useEffect(() => {
        if (authUser) {
            const unsubscribe = subscribeToMoodHistory(authUser.uid, (logs) => {
                setMoodLogs(logs);
            });
            return () => unsubscribe();
        } else {
            setMoodLogs([]);
        }
    }, [authUser]);

    // Settings State
    const [settings, setSettings] = useState<AppSettings>({
        reduceMotion: false,
        glowIntensity: true,
        highContrast: false,
    });

    const logMood = async (newLog: MoodLog) => {
        if (!authUser) return;
        try {
            await logMoodToFirestore({
                userId: authUser.uid,
                mood: newLog.mood,
                intensity: newLog.intensity,
                note: newLog.note
            });
        } catch (e) {
            console.error(e);
        }
    };

    const deleteMoodLog = async (id: string) => {
        try {
            await deleteMoodLogFromFirestore(id);
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

    const updateSettings = (key: keyof AppSettings, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    }

    return (
        <MoodContext.Provider value={{
            user,
            moodLogs,
            settings,
            logMood,
            deleteMoodLog,
            toggleSetting,
            updateSettings
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
