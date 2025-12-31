import api from "@/lib/api";
import { MoodLog } from "@/types";

export const logMoodToFirestore = async (moodData: Omit<MoodLog, 'id' | 'timestamp'>) => {
    try {
        const response = await api.post('/moods', moodData);
        return response.data;
    } catch (error) {
        console.error("Error logging mood:", error);
        throw error;
    }
};

export const deleteMoodLogFromFirestore = async (logId: string) => {
    try {
        await api.delete(`/moods/${logId}`);
    } catch (error) {
        console.error("Error deleting mood log:", error);
        throw error;
    }
};

export const getMoodHistory = async () => {
    try {
        const response = await api.get('/moods/history');
        return response.data;
    } catch (error) {
        console.error("Error fetching mood history:", error);
        return [];
    }
};
