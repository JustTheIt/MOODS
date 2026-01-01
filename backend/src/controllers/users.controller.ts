import { AuthRequest } from '@/middleware/auth.middleware';
import { UserService } from '@/services/users.service';
import { Response } from 'express';

export class UserController {
    static async getUser(req: AuthRequest, res: Response) {
        try {
            const { userId } = req.params;
            const user = await UserService.getUserProfile(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json(user);
        } catch (error: any) {
            console.error(`Error fetching user ${req.params.userId}:`, error);
            res.status(500).json({ message: error.message });
        }
    }

    static async checkUsername(req: AuthRequest, res: Response) {
        try {
            const { username } = req.body;
            if (!username) return res.status(400).json({ message: 'Username is required' });

            const isTaken = await UserService.isUsernameTaken(username);

            // Generate suggestions if username is taken
            if (isTaken) {
                const suggestions = UserService.generateUsernameSuggestions(username);
                return res.json({
                    available: false,
                    suggestions
                });
            }

            res.json({ available: true });
        } catch (error: any) {
            console.error('Error checking username:', error);
            res.status(500).json({ message: error.message });
        }
    }

    static async checkEmail(req: AuthRequest, res: Response) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ message: 'Email is required' });

            const isTaken = await UserService.isEmailTaken(email);
            res.json({ available: !isTaken });
        } catch (error: any) {
            console.error('Error checking email:', error);
            res.status(500).json({ message: error.message });
        }
    }

    static async createUser(req: AuthRequest, res: Response) {
        try {
            const { userId } = req.params;
            console.log(`Creating user profile for: ${userId}`, req.body);
            const user = await UserService.createUserProfile(userId, req.body);
            res.status(201).json(user);
        } catch (error: any) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: error.message });
        }
    }

    static async updateProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const updatedUser = await UserService.updateUserProfile(userId, req.body);
            res.json(updatedUser);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async followUser(req: AuthRequest, res: Response) {
        try {
            const { userId: targetUserId } = req.params;
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            await UserService.followUser(userId, targetUserId);
            res.json({ message: 'User followed' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async unfollowUser(req: AuthRequest, res: Response) {
        try {
            const { userId: targetUserId } = req.params;
            const userId = req.user?.uid;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            await UserService.unfollowUser(userId, targetUserId);
            res.json({ message: 'User unfollowed' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getSuggestedUsers(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            const limit = parseInt(req.query.limit as string) || 15;

            const suggestions = await UserService.getSuggestedUsers(userId, limit);
            res.json({ users: suggestions });
        } catch (error: any) {
            console.error('Error getting suggested users:', error);
            res.status(500).json({ message: error.message });
        }
    }

    static async savePushToken(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.uid;
            const { token } = req.body;
            if (!userId || !token) {
                return res.status(400).json({ message: 'Missing userId or token' });
            }

            await UserService.savePushToken(userId, token);
            res.json({ message: 'Push token saved successfully' });
        } catch (error: any) {
            console.error('Error saving push token:', error);
            res.status(500).json({ message: error.message });
        }
    }
}
