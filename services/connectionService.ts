import { db } from "@/lib/firestore";
import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";

export interface Connection {
    id: string;
    userA: string;
    userB: string;
    sharedMood: string;
    createdAt: any;
}

export const connectUsers = async (userId: string, targetUserId: string, mood: string) => {
    try {
        const connection = {
            userA: userId,
            userB: targetUserId,
            sharedMood: mood,
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, "connections"), connection);
        return { id: docRef.id, ...connection };
    } catch (error) {
        console.error("Error connecting users:", error);
        throw error;
    }
};

export const subscribeToConnections = (userId: string, callback: (connections: Connection[]) => void) => {
    // Queries in Firestore cannot do (userA == id OR userB == id) in a single simple query without 'or' operator
    // Using 'where' with 'in' or just subscribing to userA and userB separately if needed.
    // For simplicity, we query where userA == userId (since we'll likely generate matches both ways)

    const q = query(
        collection(db, "connections"),
        where("userA", "==", userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const connections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Connection));
        callback(connections);
    });
};

export const findKindredSpirits = async (userId: string, currentMood: string) => {
    try {
        // Simple logic: Find posts with the same mood from other users
        const q = query(
            collection(db, "posts"),
            where("mood", "==", currentMood),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const uniqueUsers = new Set<string>();
        const results: { userId: string }[] = [];

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.userId !== userId && !uniqueUsers.has(data.userId)) {
                uniqueUsers.add(data.userId);
                results.push({ userId: data.userId });
            }
        });

        return results.slice(0, 5); // Return top 5 potential connections
    } catch (error) {
        console.error("Error finding kindred spirits:", error);
        return [];
    }
};
