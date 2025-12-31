import { AuthRequest } from '@/middleware/auth.middleware';
import { PostService } from '@/services/posts.service';
import { Response } from 'express';

export class PostController {
    static async createPost(req: AuthRequest, res: Response) {
        try {
            const { content, mood, intensity, anonymous, imageUrl, originalPostId } = req.body;
            const userId = req.user?.uid;

            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const post = await PostService.createPost({
                userId,
                content,
                mood,
                intensity,
                anonymous,
                imageUrl,
                originalPostId,
            });

            res.status(201).json(post);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getFeed(req: AuthRequest, res: Response) {
        try {
            const { limit, lastId, mood, userId } = req.query;
            const currentUserId = req.user?.uid;

            const feed = await PostService.getFeed(
                limit ? parseInt(limit as string) : 20,
                lastId as string,
                mood as string,
                userId as string,
                currentUserId
            );
            res.json(feed);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async toggleLike(req: AuthRequest, res: Response) {
        try {
            const { postId } = req.params;
            const userId = req.user?.uid;

            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            await PostService.toggleLike(postId, userId);
            res.json({ message: 'Like toggled' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async addComment(req: AuthRequest, res: Response) {
        try {
            const { postId } = req.params;
            const { content } = req.body;
            const userId = req.user?.uid;

            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const comment = await PostService.addComment(postId, userId, content);
            res.status(201).json(comment);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async deletePost(req: AuthRequest, res: Response) {
        try {
            const { postId } = req.params;
            const userId = req.user?.uid;

            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            await PostService.deletePost(postId);
            res.json({ message: 'Post deleted' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getComments(req: AuthRequest, res: Response) {
        try {
            const { postId } = req.params;
            const comments = await PostService.getComments(postId);
            res.json(comments);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
