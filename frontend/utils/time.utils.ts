import { format, formatDistanceToNowStrict, isAfter, subDays } from 'date-fns';

/**
 * Formats a timestamp into a professional relative time string.
 * - < 1 minute: "Just now"
 * - < 24 hours: "5m", "2h"
 * - < 7 days: "3d", "Sun"
 * - > 7 days: "Jan 4"
 */
export const formatRelativeTime = (timestamp: number | Date): string => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    const now = new Date();

    // Just now
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return 'Just now';
    }

    // Handled by date-fns for relative distance
    if (isAfter(date, subDays(now, 1))) {
        const distance = formatDistanceToNowStrict(date, { addSuffix: false });
        // Abbreviate: "5 minutes" -> "5m", "2 hours" -> "2h"
        return distance
            .replace(' minutes', 'm')
            .replace(' minute', 'm')
            .replace(' hours', 'h')
            .replace(' hour', 'h')
            .replace(' seconds', 's')
            .replace(' second', 's');
    }

    // Less than a week: "3d" or day name
    if (isAfter(date, subDays(now, 7))) {
        const distance = formatDistanceToNowStrict(date, { addSuffix: false });
        if (distance.includes('days') || distance.includes('day')) {
            return distance.replace(' days', 'd').replace(' day', 'd');
        }
    }

    // Older: "Jan 4" or "Jan 4, 2023"
    if (date.getFullYear() === now.getFullYear()) {
        return format(date, 'MMM d');
    }
    return format(date, 'MMM d, yyyy');
};
