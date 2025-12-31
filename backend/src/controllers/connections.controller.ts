import { AuthRequest } from '@/middleware/auth.middleware';
import { ConnectionService } from '@/services/connections.service';
import { Response } from 'express';

export class ConnectionController {
    static async connectUsers(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const { targetUserId, mood } = req.body;
            const connection = await ConnectionService.connectUsers(userId, targetUserId, mood);
            res.status(201).json(connection);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getConnections(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const connections = await ConnectionService.getConnections(userId);
            res.json(connections);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async findKindred(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const { mood } = req.query;
            const results = await ConnectionService.findKindredSpirits(userId, mood as string);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
