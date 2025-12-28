import { db } from "@/lib/firestore";
import { MoodLog } from "@/types";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
} from "firebase/firestore";

export const logMoodToFirestore = async (moodData: Omit<MoodLog, 'id' | 'timestamp'>) => {
    try {
        const newLog = {
            ...moodData,
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, "moods"), newLog);
        return { id: docRef.id, ...newLog };
    } catch (error) {
        console.error("Error logging mood:", error);
        throw error;
    }
};

export const deleteMoodLogFromFirestore = async (logId: string) => {
    try {
        await deleteDoc(doc(db, "moods", logId));
    } catch (error) {
        console.error("Error deleting mood log:", error);
        throw error;
    }
};

export const subscribeToMoodHistory = (userId: string, callback: (logs: MoodLog[]) => void) => {
    const q = query(
        collection(db, "moods"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().createdAt ? doc.data().createdAt.toMillis() : Date.now(),
        } as MoodLog));
        callback(logs);
    });
};
