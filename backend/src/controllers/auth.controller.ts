import { auth, db } from '@/config/firebase';
import { EmailService } from '@/services/email.service';
import { OTPService } from '@/services/otp.service';
import { UserService } from '@/services/users.service';
import { Request, Response } from 'express';

export class AuthController {

    // Step 1: Register (Create inactive user + Send OTP)
    static async register(req: Request, res: Response) {
        try {
            const { email, password, username, displayName, dateOfBirth } = req.body;

            // 1. Check if username/email taken
            const emailTaken = await UserService.isEmailTaken(email);
            if (emailTaken) return res.status(409).json({ message: 'Email already in use' });

            const usernameTaken = await UserService.isUsernameTaken(username);
            if (usernameTaken) return res.status(409).json({ message: 'Username is taken' });

            // 2. Create Firebase Auth User
            const userRecord = await auth.createUser({
                email,
                password,
                displayName: displayName || username,
            });

            // 3. Create User Profile
            await UserService.createUserProfile(userRecord.uid, {
                email,
                username,
                displayName: displayName || username,
                dateOfBirth,
                emailVerified: false, // Important flag
            });

            // 4. Generate & Send OTP
            const otp = OTPService.generateOTP();
            await OTPService.storeOTP(email, otp, userRecord.uid);

            console.log('\n========================================');
            console.log(`🔑 NEW REGISTRATION OTP FOR: ${email}`);
            console.log(`🔐 CODE: ${otp}`);
            console.log('========================================\n');

            try {
                await EmailService.sendOTP(email, otp);
            } catch (emailError: any) {
                console.error(`[Auth] ❌ SMTP failed for ${email}. Error:`, emailError.message);

                return res.status(201).json({
                    message: 'Account created! (Note: Email delivery failed, check server logs for code)',
                    userId: userRecord.uid,
                    email,
                });
            }

            res.status(201).json({
                message: 'Registration successful. Please verify your email.',
                userId: userRecord.uid,
                email
            });

        } catch (error: any) {
            console.error('Error in register:', error);
            res.status(500).json({ message: error.message });
        }
    }

    // Step 2: Verify OTP
    static async verifyOTP(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({ message: 'Email and OTP are required' });
            }

            const result = await OTPService.verifyOTP(email, otp);
            if (!result.valid) {
                return res.status(400).json({ message: "That code doesn't look right. Please try again." });
            }

            // Mark user as verified
            // Find user by email
            const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
            if (userSnapshot.empty) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userDoc = userSnapshot.docs[0];
            await userDoc.ref.update({
                emailVerified: true
            });

            // Also update Firebase Auth emailVerified
            await auth.updateUser(userDoc.id, {
                emailVerified: true
            });

            // Create a custom token for auto-login
            const token = await auth.createCustomToken(userDoc.id);

            res.json({
                success: true,
                message: 'Email verified successfully',
                token,
                user: { id: userDoc.id, ...userDoc.data(), emailVerified: true }
            });

        } catch (error: any) {
            console.error('Error in verifyEmail:', error);
            res.status(500).json({ message: error.message });
        }
    }

    // Step 3: Resend OTP
    static async resendOTP(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ message: 'Email is required' });

            const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
            const userId = !userSnapshot.empty ? userSnapshot.docs[0].id : undefined;

            const otp = OTPService.generateOTP();
            await OTPService.storeOTP(email, otp, userId);

            console.log('\n========================================');
            console.log(`🔑 RESEND OTP FOR: ${email}`);
            console.log(`🔐 CODE: ${otp}`);
            console.log('========================================\n');

            try {
                await EmailService.sendOTP(email, otp);
                return res.json({ message: 'Verification code sent to your email!' });
            } catch (emailError: any) {
                console.error(`[Auth] ❌ SMTP resend failed for ${email}. Error:`, emailError.message);

                return res.status(200).json({
                    message: 'Code generated! (Note: Email delivery failed, check server logs)',
                    traceId: 'v3_force_success'
                });
            }
        } catch (error: any) {
            console.error('Error in resendOTP:', error);
            res.status(500).json({ message: error.message });
        }
    }
}
