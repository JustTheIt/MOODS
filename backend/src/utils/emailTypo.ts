/**
 * Email Typo Detection Utility
 * Detects common domain typos and suggests corrections.
 */

const COMMON_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'live.com',
    'aol.com',
    'protonmail.com',
];

const COMMON_TYPOS: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gjal.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yhoo.com': 'yahoo.com',
    'uahoo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmil.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outlk.com': 'outlook.com',
    'iclud.com': 'icloud.com',
};

export const detectEmailTypo = (email: string): string | null => {
    if (!email || !email.includes('@')) return null;

    const [localPart, domain] = email.split('@');
    const lowerDomain = domain.toLowerCase();

    // 1. Direct typo map check
    if (COMMON_TYPOS[lowerDomain]) {
        return `${localPart}@${COMMON_TYPOS[lowerDomain]}`;
    }

    // 2. Levenshtein-like close match (simple version)
    // If the domain is very close to a common domain, suggest it.
    for (const common of COMMON_DOMAINS) {
        if (lowerDomain !== common && isCloseMatch(lowerDomain, common)) {
            return `${localPart}@${common}`;
        }
    }

    return null;
};

// Check if two strings differ by only 1 character (substitution, deletion, insertion)
const isCloseMatch = (str1: string, str2: string): boolean => {
    if (Math.abs(str1.length - str2.length) > 1) return false;

    let differences = 0;
    let i = 0;
    let j = 0;

    while (i < str1.length && j < str2.length) {
        if (str1[i] !== str2[j]) {
            differences++;
            if (differences > 1) return false;

            if (str1.length > str2.length) i++;
            else if (str1.length < str2.length) j++;
            else { i++; j++; }
        } else {
            i++;
            j++;
        }
    }

    if (i < str1.length || j < str2.length) differences++;

    return differences === 1;
};
