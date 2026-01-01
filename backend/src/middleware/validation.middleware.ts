import { NextFunction, Request, Response } from 'express';

/**
 * Backend Validation Middleware
 * Server-side validation to prevent bypassing frontend validation
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

interface EmailValidationResult {
    isValid: boolean;
    error?: string;
    normalized: string;
}

/**
 * Validates and normalizes email on the server side
 */
import { detectEmailTypo } from '@/utils/emailTypo';

// ...

export const validateEmail = (email: string): EmailValidationResult => {
    if (!email || typeof email !== 'string') {
        return {
            isValid: false,
            error: 'Email is required',
            normalized: ''
        };
    }

    const trimmed = email.trim();

    // Check maximum length (RFC 5321)
    if (trimmed.length > 254) {
        return {
            isValid: false,
            error: 'Email address is too long (maximum 254 characters)',
            normalized: ''
        };
    }

    // RFC 5322 compliant email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return {
            isValid: false,
            error: 'Invalid email format',
            normalized: ''
        };
    }

    const normalized = trimmed.toLowerCase();

    // Check for typos
    const suggestion = detectEmailTypo(normalized);
    if (suggestion) {
        return {
            isValid: false,
            error: `Did you mean ${suggestion}?`,
            normalized: ''
        };
    }

    return {
        isValid: true,
        normalized
    };
};

// ============================================================================
// USERNAME VALIDATION
// ============================================================================

interface UsernameValidationResult {
    isValid: boolean;
    error?: string;
    normalized: string;
}

// Reserved usernames (must match frontend list)
const RESERVED_USERNAMES = [
    // System usernames
    'admin', 'administrator', 'support', 'help', 'api', 'moods', 'official',
    'system', 'root', 'superuser', 'moderator', 'mod',

    // Feature-related
    'settings', 'profile', 'notifications', 'messages', 'search', 'explore',
    'discover', 'trending', 'home', 'feed', 'post', 'story', 'stories',

    // Common/generic
    'user', 'guest', 'test', 'demo', 'example', 'sample',
    'null', 'undefined', 'none', 'anonymous', 'anon',

    // Potentially offensive/confusing
    'everyone', 'all', 'nobody', 'someone', 'anyone',
];

/**
 * Validates and normalizes username on the server side
 */
export const validateUsername = (username: string): UsernameValidationResult => {
    if (!username || typeof username !== 'string') {
        return {
            isValid: false,
            error: 'Username is required',
            normalized: ''
        };
    }

    const trimmed = username.trim();
    const normalized = trimmed.toLowerCase();

    // Check length
    if (normalized.length < 3) {
        return {
            isValid: false,
            error: 'Username must be at least 3 characters',
            normalized
        };
    }

    if (normalized.length > 20) {
        return {
            isValid: false,
            error: 'Username must be 20 characters or less',
            normalized
        };
    }

    // Check if starts with a letter
    if (!/^[a-z]/.test(normalized)) {
        return {
            isValid: false,
            error: 'Username must start with a letter',
            normalized
        };
    }

    // Check allowed characters
    if (!/^[a-z][a-z0-9_]*$/.test(normalized)) {
        return {
            isValid: false,
            error: 'Username can only contain letters, numbers, and underscores',
            normalized
        };
    }

    // Check for consecutive underscores
    if (/__/.test(normalized)) {
        return {
            isValid: false,
            error: 'Username cannot have consecutive underscores',
            normalized
        };
    }

    // Check against reserved usernames
    if (RESERVED_USERNAMES.includes(normalized)) {
        return {
            isValid: false,
            error: 'This username is reserved',
            normalized
        };
    }

    return {
        isValid: true,
        normalized
    };
};

// ============================================================================
// EXPRESS MIDDLEWARE
// ============================================================================

/**
 * Middleware to validate email in request body
 */
export const validateEmailMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const result = validateEmail(email);

    if (!result.isValid) {
        console.log(`Validation failed for email: ${result.error}`);
        return res.status(400).json({
            error: result.error,
            field: 'email'
        });
    }

    // Attach normalized email to request
    req.body.email = result.normalized;
    next();
};

/**
 * Middleware to validate username in request body
 */
export const validateUsernameMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;

    const result = validateUsername(username);

    if (!result.isValid) {
        return res.status(400).json({
            error: result.error,
            field: 'username'
        });
    }

    // Attach normalized username to request
    req.body.username = result.normalized;
    next();
};

/**
 * Middleware to validate both email and username for user registration
 */
export const validateRegistrationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { email, username } = req.body;

    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
        return res.status(400).json({
            error: emailResult.error,
            field: 'email'
        });
    }

    // Validate username
    const usernameResult = validateUsername(username);
    if (!usernameResult.isValid) {
        return res.status(400).json({
            error: usernameResult.error,
            field: 'username'
        });
    }

    // Attach normalized values to request
    req.body.email = emailResult.normalized;
    req.body.username = usernameResult.normalized;

    next();
};
