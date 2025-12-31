import { PostController } from '@/controllers/posts.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/feed', PostController.getFeed);
router.post('/', authenticate, PostController.createPost);
router.post('/:postId/like', authenticate, PostController.toggleLike);
router.post('/:postId/comments', authenticate, PostController.addComment);
router.get('/:postId/comments', PostController.getComments);
router.delete('/:postId', authenticate, PostController.deletePost);

export default router;
