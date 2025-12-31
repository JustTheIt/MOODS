import { AuthRequest } from '@/middleware/auth.middleware';
import { notificationService } from '@/services/notificationService';
import { Response } from 'express';

export class NotificationController {
    static async getNotifications(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const { limit, lastId } = req.query;
            const notifications = await notificationService.getUserNotifications(
                userId,
                limit ? parseInt(limit as string) : 20,
                lastId as string
            );
            res.json(notifications);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async markAsRead(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const { id } = req.params;
            await notificationService.markAsRead(id);
            res.json({ message: 'Notification marked as read' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async markAllAsRead(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            await notificationService.markAllAsRead(userId);
            res.json({ message: 'All notifications marked as read' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
