import { AuthRequest } from '@/middleware/auth.middleware';
import { StoryService } from '@/services/stories.service';
import { Response } from 'express';

export class StoryController {
    static async createStory(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const story = await StoryService.createStory(userId, req.body);
            res.status(201).json(story);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getActiveStories(req: AuthRequest, res: Response) {
        try {
            const stories = await StoryService.getActiveStories();
            res.json(stories);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async deleteStory(req: AuthRequest, res: Response) {
        try {
            const { storyId } = req.params;
            await StoryService.deleteStory(storyId);
            res.json({ message: 'Story deleted' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async markAsViewed(req: AuthRequest, res: Response) {
        try {
            const { storyId } = req.params;
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            await StoryService.markStoryAsViewed(userId, storyId);
            res.json({ message: 'Story marked as viewed' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getViewedStories(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const viewedIds = await StoryService.getViewedStories(userId);
            res.json(viewedIds);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
