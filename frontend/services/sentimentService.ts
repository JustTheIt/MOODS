import { MoodType } from "@/constants/theme";
import api from "@/lib/api";

export const analyzeMood = async (text: string): Promise<MoodType | null> => {
    try {
        if (!text || text.trim().length < 3) return null;

        const response = await api.post('/moods/analyze', { text });
        return response.data.mood as MoodType;
    } catch (error) {
        console.error("Error analyzing mood:", error);
        return null;
    }
};
