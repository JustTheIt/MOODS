import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

// Get current user profile
router.get('/me', authenticate, (req: any, res) => {
    res.json({ user: req.user });
});

export default router;
