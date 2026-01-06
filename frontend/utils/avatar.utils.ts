/**
 * Generate a default avatar URL using UI Avatars API
 * Creates a PNG image with the user's initials on a colored background
 * 
 * @param name - User's full name or username
 * @param size - Size of the avatar in pixels (default: 200)
 * @returns URL to the generated avatar PNG
 */
export const generateAvatarUrl = (name: string, size: number = 200): string => {
    if (!name) name = 'User';

    // Clean the name and get initials
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);

    let initials = '';
    if (parts.length === 0) {
        initials = '?';
    } else if (parts.length === 1) {
        initials = parts[0].charAt(0).toUpperCase();
    } else {
        // First + Last initial
        initials = parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
    }

    // Generate a consistent color based on the name
    const colors = [
        'FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEEAD',
        'D4A5A5', '9B59B6', '3498DB', 'E67E22', '2ECC71'
    ];

    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
        hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    const backgroundColor = colors[colorIndex];

    // Use UI Avatars API to generate the PNG
    // Format: https://ui-avatars.com/api/?name=John+Doe&size=200&background=FF6B6B&color=fff&bold=true
    const params = new URLSearchParams({
        name: initials,
        size: size.toString(),
        background: backgroundColor,
        color: 'ffffff',
        bold: 'true',
        'font-size': '0.5', // Relative to size
        rounded: 'false', // We'll handle rounding in the component
    });

    return `https://ui-avatars.com/api/?${params.toString()}`;
};
