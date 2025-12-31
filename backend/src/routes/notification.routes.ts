import { NotificationController } from '@/controllers/notification.controller';
import { authenticate as authMiddleware } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/', authMiddleware, NotificationController.getNotifications);
router.post('/:id/read', authMiddleware, NotificationController.markAsRead);
router.post('/read-all', authMiddleware, NotificationController.markAllAsRead);

export default router;
