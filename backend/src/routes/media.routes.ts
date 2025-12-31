import { MediaController } from '@/controllers/media.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/sign', authenticate, MediaController.getSignedUrl);

export default router;
