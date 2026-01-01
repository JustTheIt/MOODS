import admin from 'firebase-admin';
import { env } from './env';

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
});
console.log('✅ Firebase Admin initialized');

export const auth = admin.auth();
export const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
export default admin;
