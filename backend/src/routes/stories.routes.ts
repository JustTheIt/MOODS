import { StoryController } from '@/controllers/stories.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/', StoryController.getActiveStories);
router.get('/viewed', authenticate, StoryController.getViewedStories);
router.post('/', authenticate, StoryController.createStory);
router.post('/:storyId/view', authenticate, StoryController.markAsViewed);
router.delete('/:storyId', authenticate, StoryController.deleteStory);

export default router;
