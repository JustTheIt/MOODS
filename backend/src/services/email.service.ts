import { env } from '@/config/env';

import nodemailer from 'nodemailer';


export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: env.GMAIL_USER,
            pass: env.GMAIL_APP_PASSWORD,
        },
    });

    // Verify connection on startup
    static {
        // Only verify in production to avoid crashing dev on bad credentials
        if (env.NODE_ENV === 'production') {
            this.transporter.verify((error) => {
                if (error) {
                    console.error('[EmailService] ❌ SMTP Connection Error:', error.message);
                } else {
                    console.log('[EmailService] ✅ SMTP Connection ready');
                }
            });
        }
    }

    static async sendOTP(to: string, otp: string) {
        const maskedPass = env.GMAIL_APP_PASSWORD ? `${env.GMAIL_APP_PASSWORD.slice(0, 3)}...${env.GMAIL_APP_PASSWORD.slice(-3)}` : 'MISSING';
        console.log(`[EmailService] 📧 Sending REAL OTP to ${to}... (Using User: ${env.GMAIL_USER}, Pass: ${maskedPass})`);
        try {
            await this.transporter.sendMail({
                from: `"MOODS App" <${env.GMAIL_USER}>`,
                to,
                subject: 'Your Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4A90E2; text-align: center;">Verify your MOODS Account</h2>
                        <p style="font-size: 16px;">Hello,</p>
                        <p style="font-size: 16px;">Use the verification code below to complete your registration. This code is valid for 10 minutes.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <h1 style="font-size: 40px; letter-spacing: 8px; background: #f8f9fa; padding: 20px; display: inline-block; border-radius: 8px; color: #333; font-weight: bold;">${otp}</h1>
                        </div>
                        <p style="font-size: 14px; color: #666; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} MOODS Team</p>
                    </div>
                `,
            });
            console.log(`[EmailService] ✅ SUCCESS! Real email delivered to ${to}`);
        } catch (error: any) {
            console.error(`[EmailService] ❌ SMTP FAILED:`, error.message);
            // Fallback to console so the developer can at least see the code if SMTP fails
            this.logMockEmail(to, otp);
            throw error;
        }
    }

    private static logMockEmail(to: string, otp: string) {
        console.log('================================================================');
        console.log(`[EmailService] 📧 MOCK EMAIL TO: ${to}`);
        console.log(`Subject: Verify your MOODS account`);
        console.log(``);
        console.log(`Your verification code is:`);
        console.log(``);
        console.log(`🔐 ${otp}`);
        console.log(``);
        console.log(`This code expires in 10 minutes.`);
        console.log(`— MOODS Team`);
        console.log('================================================================');
    }
}
