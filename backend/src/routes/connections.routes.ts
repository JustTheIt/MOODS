import { ConnectionController } from '@/controllers/connections.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.use(authenticate);

router.post('/connect', ConnectionController.connectUsers);
router.get('/', ConnectionController.getConnections);
router.get('/kindred', ConnectionController.findKindred);

export default router;
