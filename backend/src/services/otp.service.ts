import { db } from '@/config/firebase';
import crypto from 'crypto';
import admin from 'firebase-admin';

export class OTPService {
    private static readonly OTP_EXPIRY_MINUTES = 10;
    private static readonly COLLECTION = 'email_otps';

    static generateOTP(): string {
        // Generate a 6-digit number
        return crypto.randomInt(100000, 999999).toString();
    }

    static hashOTP(otp: string): string {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }

    static async storeOTP(email: string, otp: string, userId?: string) {
        const hashedOTP = this.hashOTP(otp);
        const expiresAt = Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000;

        await db.collection(this.COLLECTION).doc(email).set({
            hashedOTP,
            expiresAt,
            attempts: 0,
            email,
            userId: userId || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    static async verifyOTP(email: string, otp: string): Promise<{ valid: boolean; message?: string }> {
        const docRef = db.collection(this.COLLECTION).doc(email);
        const doc = await docRef.get();

        if (!doc.exists) {
            return { valid: false, message: 'Invalid or expired code.' };
        }

        const data = doc.data();
        if (!data) return { valid: false, message: 'Invalid code.' };

        // Check expiry
        if (Date.now() > data.expiresAt) {
            return { valid: false, message: 'Code has expired. Please request a new one.' };
        }

        // Check max attempts (e.g., 5)
        if (data.attempts >= 5) {
            return { valid: false, message: 'Too many failed attempts. Please request a new code.' };
        }

        // Verify hash
        const hashedInput = this.hashOTP(otp);
        if (hashedInput !== data.hashedOTP) {
            // Increment attempts
            await docRef.update({
                attempts: admin.firestore.FieldValue.increment(1)
            });
            return { valid: false, message: 'Incorrect code.' };
        }

        // Cleanup after success
        await docRef.delete();
        return { valid: true };
    }
}
