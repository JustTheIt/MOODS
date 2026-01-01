import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Email Verification Middleware
 * Enforces email verification for protected actions
 */

/**
 * Middleware to require email verification
 * Must be used after authenticate middleware
 */
export const requireEmailVerification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to continue'
            });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({
                error: 'Email verification required',
                message: 'Please verify your email to use this feature. Check your inbox for a verification link.',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }

        next();
    } catch (error: any) {
        console.error('Email verification middleware error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
