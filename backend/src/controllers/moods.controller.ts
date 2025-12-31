import { AuthRequest } from '@/middleware/auth.middleware';
import { MoodService } from '@/services/moods.service';
import { Response } from 'express';

export class MoodController {
    static async logMood(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const log = await MoodService.logMood(userId, req.body);
            res.status(201).json(log);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getHistory(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const history = await MoodService.getMoodHistory(userId);
            res.json(history);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async deleteMood(req: AuthRequest, res: Response) {
        try {
            const { moodId } = req.params;
            await MoodService.deleteMood(moodId);
            res.json({ message: 'Mood log deleted' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
