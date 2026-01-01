import { env } from '../config/env';
import { EmailService } from '../services/email.service';

async function testEmail() {
    console.log('Testing Email Service...');
    console.log(`GMAIL_USER: ${env.GMAIL_USER ? 'Set' : 'Missing'}`);
    console.log(`GMAIL_APP_PASSWORD: ${env.GMAIL_APP_PASSWORD ? 'Set' : 'Missing'}`);

    if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
        console.error('❌ Missing credentials in .env');
        process.exit(1);
    }

    // Change this to your target email for testing
    const targetEmail = env.GMAIL_USER;
    console.log(`Sending test OTP to ${targetEmail}...`);

    try {
        await EmailService.sendOTP(targetEmail, '123456');
        console.log('✅ Test complete.');
    } catch (error: any) {
        console.error('❌ Test failed with error:', error);
        if (error.response) console.error('Error Response:', error.response);
    }
}

testEmail();
