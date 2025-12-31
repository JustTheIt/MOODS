import { UserController } from '@/controllers/users.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validateRegistrationMiddleware, validateUsernameMiddleware } from '@/middleware/validation.middleware';
import { Router } from 'express';

const router = Router();

// Public routes with validation
router.post('/check-username', validateUsernameMiddleware, UserController.checkUsername);
router.post('/check-email', UserController.checkEmail);

// User routes
router.get('/:userId', UserController.getUser);
router.post('/:userId', validateRegistrationMiddleware, UserController.createUser);
router.patch('/me', authenticate, UserController.updateProfile);
router.post('/:userId/follow', authenticate, UserController.followUser);
router.post('/:userId/unfollow', authenticate, UserController.unfollowUser);

export default router;

