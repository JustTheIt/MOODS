import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validateRegistrationMiddleware } from '@/middleware/validation.middleware';
import { Router } from 'express';

const router = Router();

// Auth routes
router.post('/register', validateRegistrationMiddleware, AuthController.register);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/resend-otp', AuthController.resendOTP);

// Get current user profile
router.get('/me', authenticate, (req: any, res) => {
    res.json({ user: req.user });
});

export default router;
