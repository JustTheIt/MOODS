import admin from 'firebase-admin';
import { env } from './env';

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: env.FIREBASE_PROJECT_ID,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
        }),
    });
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
