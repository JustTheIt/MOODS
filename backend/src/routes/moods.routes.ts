import { MoodController } from '@/controllers/moods.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(authenticate);

router.post('/', MoodController.logMood);
router.get('/history', MoodController.getHistory);
router.delete('/:moodId', MoodController.deleteMood);

export default router;
