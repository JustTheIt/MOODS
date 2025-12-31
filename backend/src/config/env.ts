import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Firebase
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_PRIVATE_KEY: z.string(),
    FIREBASE_CLIENT_EMAIL: z.string(),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),

    // Frontend
    CORS_ORIGIN: z.string().default('*'),
});

// Map EXPO_PUBLIC_ prefixes if standard keys are missing
const mappedEnv = {
    ...process.env,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || process.env.EXPO_PUBLIC_FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || process.env.EXPO_PUBLIC_FIREBASE_CLIENT_EMAIL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET,
};

const envVars = envSchema.safeParse(mappedEnv);

if (!envVars.success) {
    console.error('❌ Invalid environment variables:', envVars.error.format());
    process.exit(1);
}

export const env = envVars.data;
