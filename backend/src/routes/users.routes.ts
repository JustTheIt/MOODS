import { UserController } from '@/controllers/users.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requireEmailVerification } from '@/middleware/emailVerification.middleware';
import { validateRegistrationMiddleware, validateUsernameMiddleware } from '@/middleware/validation.middleware';
import { Router } from 'express';

const router = Router();

// Public routes with validation
router.post('/check-username', validateUsernameMiddleware, UserController.checkUsername);
router.post('/check-email', UserController.checkEmail);

// Suggested users (requires authentication but not verification for browsing)
router.get('/suggested', authenticate, UserController.getSuggestedUsers);

// User routes (browsing allowed without verification)
router.get('/:userId', UserController.getUser);
router.post('/:userId', validateRegistrationMiddleware, UserController.createUser);
router.patch('/me', authenticate, UserController.updateProfile);
router.post('/me/push-token', authenticate, UserController.savePushToken);

// Protected routes (require email verification)
router.post('/:userId/follow', authenticate, requireEmailVerification, UserController.followUser);
router.post('/:userId/unfollow', authenticate, requireEmailVerification, UserController.unfollowUser);

export default router;
