import { auth } from "@/lib/auth";
import { db } from "@/lib/firestore";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    dominantMood: "happy" | "sad" | "calm" | "angry" | "love";
    themeColor: string;
    isAnonymous: boolean;
    createdAt: any;
}

const DEFAULT_THEMES = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#D4A5A5"];

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!auth.currentUser) return null;
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const createUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        const userRef = doc(db, "users", userId);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            const randomTheme = DEFAULT_THEMES[Math.floor(Math.random() * DEFAULT_THEMES.length)];
            const newUser: UserProfile = {
                id: userId,
                email: data.email || "",
                username: data.username || "User",
                avatarUrl: data.avatarUrl || null,
                bio: data.bio || null,
                dominantMood: data.dominantMood || "calm",
                themeColor: data.themeColor || randomTheme,
                isAnonymous: data.isAnonymous ?? false,
                createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUser);
            return newUser;
        }
        return { id: snapshot.id, ...snapshot.data() } as UserProfile;
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
