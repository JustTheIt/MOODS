/**
 * Email and Username Validation Utilities
 * Provides comprehensive validation with typo detection and supportive error messaging
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

interface EmailValidationResult {
    isValid: boolean;
    suggestion?: string;
    error?: string;
    normalized?: string;
}

// Common email domain typos mapping
const EMAIL_TYPO_MAP: Record<string, string> = {
    // Gmail variations
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmailcom': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmaul.com': 'gmail.com',

    // Yahoo variations
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yhoo.com': 'yahoo.com',
    'yahoocom': 'yahoo.com',
    'yaoo.com': 'yahoo.com',

    // Hotmail variations
    'hotmial.com': 'hotmail.com',
    'hotmil.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmailcom': 'hotmail.com',
    'hotmal.com': 'hotmail.com',

    // Outlook variations
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'outlookcom': 'outlook.com',
    'outllook.com': 'outlook.com',
};

/**
 * Validates email format and detects common domain typos
 */
export const validateEmail = (email: string): EmailValidationResult => {
    if (!email) {
        return { isValid: false, error: '' };
    }

    const trimmedEmail = email.trim();

    // Check maximum length (RFC 5321)
    if (trimmedEmail.length > 254) {
        return {
            isValid: false,
            error: 'Email address is a bit too long. Please use a shorter one.'
        };
    }

    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
        return {
            isValid: false,
            error: "Let's make sure this email looks right"
        };
    }

    // Extract domain and check for typos
    const domain = trimmedEmail.split('@')[1]?.toLowerCase();
    const localPart = trimmedEmail.split('@')[0];

    if (domain && EMAIL_TYPO_MAP[domain]) {
        const suggestedDomain = EMAIL_TYPO_MAP[domain];
        const suggestedEmail = `${localPart}@${suggestedDomain}`;

        return {
            isValid: true, // Still valid, just suggesting correction
            suggestion: suggestedEmail,
            normalized: trimmedEmail.toLowerCase()
        };
    }

    return {
        isValid: true,
        normalized: trimmedEmail.toLowerCase()
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

// Reserved usernames that cannot be used
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
 * Validates username format and checks against reserved words
 */
export const validateUsername = (username: string): UsernameValidationResult => {
    if (!username) {
        return { isValid: false, error: '', normalized: '' };
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

    // Check allowed characters (lowercase letters, numbers, underscores)
    if (!/^[a-z][a-z0-9_]*$/.test(normalized)) {
        return {
            isValid: false,
            error: 'Usernames can only contain letters, numbers, and underscores',
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
            error: 'This username is reserved. Please choose another',
            normalized
        };
    }

    return { isValid: true, normalized };
};

/**
 * Generates username suggestions when the desired username is taken
 */
export const generateUsernameSuggestions = (baseUsername: string): string[] => {
    const normalized = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const suggestions: string[] = [];

    // Get current year
    const currentYear = new Date().getFullYear();

    // Suggestion 1: Add random 2-digit number
    const randomNum = Math.floor(Math.random() * 90) + 10;
    suggestions.push(`${normalized}_${randomNum}`);

    // Suggestion 2: Add current year
    suggestions.push(`${normalized}_${currentYear}`);

    // Suggestion 3: Add ".moods" suffix
    suggestions.push(`${normalized}.moods`);

    return suggestions.filter(s => s.length >= 3 && s.length <= 20);
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes email for storage (lowercase, trimmed)
 */
export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

/**
 * Normalizes username for storage (lowercase, trimmed)
 */
export const normalizeUsername = (username: string): string => {
    return username.trim().toLowerCase();
};

/**
 * Checks if a string contains only allowed username characters
 */
export const hasValidUsernameCharacters = (username: string): boolean => {
    return /^[a-z0-9_]+$/i.test(username);
};
