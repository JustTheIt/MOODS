import { PostController } from '@/controllers/posts.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { requireEmailVerification } from '@/middleware/emailVerification.middleware';
import { Router } from 'express';

const router = Router();

// Public routes (no verification required)
router.get('/feed', PostController.getFeed);
router.get('/trending', PostController.getTrendingPosts);
router.get('/:postId/comments', PostController.getComments);

// Protected routes (require authentication + email verification)
router.post('/', authenticate, requireEmailVerification, PostController.createPost);
router.post('/:postId/like', authenticate, requireEmailVerification, PostController.toggleLike);
router.post('/:postId/comments', authenticate, requireEmailVerification, PostController.addComment);
router.delete('/:postId', authenticate, requireEmailVerification, PostController.deletePost);

export default router;

