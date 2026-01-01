import axios from 'axios';
import * as Device from 'expo-device';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

/**
 * API Base URL Resolver
 * 1. Env variable takes priority
 * 2. Real device/Emulator: Try to auto-detect host IP from Expo Constants
 * 3. Fallback to known Android emulator IP or localhost
 */
const getBaseUrl = () => {
    // If env variable is set, use it but clean it (remove trailing slash and /api)
    let envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) {
        return envUrl.replace(/\/api$/, '').replace(/\/$/, '');
    }

    // Special case for Android Emulator
    if (!Device.isDevice && Platform.OS === 'android') {
        return 'http://10.0.2.2:5001';
    }

    // Try to auto-detect from Expo packager
    const debuggerHost = Constants.expoConfig?.hostUri;
    const hostIP = debuggerHost?.split(':')?.[0];

    if (hostIP) {
        if (Platform.OS === 'android' && (hostIP === 'localhost' || hostIP === '127.0.0.1')) {
            return 'http://10.0.2.2:5001';
        }
        return `http://${hostIP}:5001`;
    }

    // Manual fallbacks
    if (Device.isDevice) {
        return 'http://192.168.5.59:5001';
    }

    return 'http://localhost:5001';
};

const API_URL = getBaseUrl();
console.log(`[API] Platform: ${Platform.OS}, Device: ${Device.isDevice ? 'Real' : 'Emulator'}`);
console.log(`[API] Base URL: ${API_URL}`);

/**
 * Helper to get the ID token, waiting for auth to hydrate if necessary
 */
const getValidIdToken = async (): Promise<string | null> => {
    const auth = getAuth();

    // If user is already there, just get the token
    if (auth.currentUser) {
        return auth.currentUser.getIdToken();
    }

    // If no user, wait up to 2 seconds for auth to hydrate
    return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            if (auth.currentUser) {
                clearInterval(interval);
                const token = await auth.currentUser.getIdToken();
                resolve(token);
            } else if (attempts >= 10) { // 2 seconds total (10 * 200ms)
                clearInterval(interval);
                resolve(null);
            }
        }, 200);
    });
};

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000, // 15s timeout for mobile networks
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(async (config) => {
    try {
        // Robust /api prefixing: 
        // Only add if not already in URL AND not already in baseURL
        const hasApiInBase = config.baseURL?.endsWith('/api');
        const hasApiInUrl = config.url?.startsWith('/api');

        if (!hasApiInBase && !hasApiInUrl) {
            config.url = `/api${config.url?.startsWith('/') ? '' : '/'}${config.url}`;
        }

        const token = await getValidIdToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("[API] Interceptor Error:", error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, config } = error;
        const fullUrl = `${config?.baseURL || ''}${config?.url || ''}`;

        // Suppress logging for 404s on user profile fetches (expected for new users)
        const isUserFetch404 = response?.status === 404 && config?.url?.includes('/users/');

        if (!isUserFetch404) {
            console.error(`[API] Error on ${config?.method?.toUpperCase()} ${fullUrl}:`, {
                status: response?.status,
                message: response?.data?.message || error.message,
                code: response?.data?.code,
                headers: config?.headers
            });
        }
        return Promise.reject(error);
    }
);

export default api;
