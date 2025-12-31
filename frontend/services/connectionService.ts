import api from "@/lib/api";

export interface Connection {
    id: string;
    userA: string;
    userB: string;
    sharedMood: string;
    createdAt: any;
}

export const connectUsers = async (userId: string, targetUserId: string, mood: string) => {
    try {
        const response = await api.post('/connections/connect', { targetUserId, mood });
        return response.data;
    } catch (error) {
        console.error("Error connecting users:", error);
        throw error;
    }
};

export const getConnections = async () => {
    try {
        const response = await api.get('/connections');
        return response.data;
    } catch (error) {
        console.error("Error fetching connections:", error);
        return [];
    }
};

export const findKindredSpirits = async (userId: string, currentMood: string) => {
    try {
        const response = await api.get('/connections/kindred', {
            params: { mood: currentMood }
        });
        return response.data;
    } catch (error) {
        console.error("Error finding kindred spirits:", error);
        return [];
    }
};
