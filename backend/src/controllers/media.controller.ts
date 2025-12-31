import cloudinary from '@/config/cloudinary';
import { env } from '@/config/env';
import { AuthRequest } from '@/middleware/auth.middleware';
import { Response } from 'express';

export class MediaController {
    static async getSignedUrl(req: AuthRequest, res: Response) {
        try {
            const timestamp = Math.round(new Date().getTime() / 1000);
            const signature = cloudinary.utils.api_sign_request(
                { timestamp, upload_preset: 'moods_preset' }, // replace with your preset if needed
                env.CLOUDINARY_API_SECRET
            );

            res.json({
                signature,
                timestamp,
                apiKey: env.CLOUDINARY_API_KEY,
                cloudName: env.CLOUDINARY_CLOUD_NAME,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
