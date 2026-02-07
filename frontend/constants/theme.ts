export const MOOD_COLORS = {
  happy: {
    primary: '#FCD34D',    // Warm Gold
    secondary: '#FEF9C3',  // Light Creamy Yellow
    gradient: ['#FCD34D', '#F59E0B'] as const,
    text: '#78350F',       // Deep Brown for contrast
    glow: 'rgba(252, 211, 77, 0.4)',
  },
  sad: {
    primary: '#4682B4', // SteelBlue
    secondary: '#B0C4DE', // LightSteelBlue
    gradient: ['#4682B4', '#191970'] as const,
    text: '#1a3045',
    glow: 'rgba(70, 130, 180, 0.6)',
  },
  angry: {
    primary: '#FF4500', // OrangeRed
    secondary: '#FA8072', // Salmon
    gradient: ['#FF4500', '#8B0000'] as const,
    text: '#4d1500',
    glow: 'rgba(255, 69, 0, 0.6)',
  },
  love: {
    primary: '#FF1493', // DeepPink
    secondary: '#FFB6C1', // LightPink
    gradient: ['#FF1493', '#C71585'] as const,
    text: '#4d062c',
    glow: 'rgba(255, 20, 147, 0.6)',
  },
  calm: {
    primary: '#20B2AA', // LightSeaGreen
    secondary: '#AFEEEE', // PaleTurquoise
    gradient: ['#20B2AA', '#008080'] as const,
    text: '#093633',
    glow: 'rgba(32, 178, 170, 0.6)',
  },
  anxious: {
    primary: '#FF8C00', // DarkOrange
    secondary: '#FFE4B5', // Moccasin
    gradient: ['#FF8C00', '#A0522D'] as const,
    text: '#4d2a00',
    glow: 'rgba(255, 140, 0, 0.6)',
  },
  tired: {
    primary: '#7B68EE', // MediumSlateBlue
    secondary: '#E6E6FA', // Lavender
    gradient: ['#7B68EE', '#483D8B'] as const,
    text: '#251f47',
    glow: 'rgba(123, 104, 238, 0.6)',
  },
};

export const THEME = {
  primary: '#FF6B6B',
  dark: {
    background: '#02040A', // Deepest Navy/Black
    card: '#0F172A',       // Rich Slate Surface
    text: '#F3F4F6',       // Gray 100
    textPrimary: '#F3F4F6',
    textSecondary: '#94A3B8', // Slate 400
    textTertiary: '#64748B',  // Slate 500
    border: '#1E293B',     // Slate 800
    divider: '#1E293B',
    icon: '#94A3B8',
    tabBar: '#0B1120',     // Darker than card
    error: '#EF4444',
    success: '#10B981',
    calm: '#A8C3A8',
  },
  light: {
    background: '#F6F6F6', // Light Gray (Requested)
    card: '#FFFFFF',       // White
    text: '#111111',       // Requested Dark Gray
    textPrimary: '#111111',
    textSecondary: '#6B7280', // Requested Muted Gray
    textTertiary: '#9CA3AF',
    border: '#E5E5E5',     // Requested Divider
    divider: '#E5E5E5',
    icon: '#4B5563',
    tabBar: '#FFFFFF',
    error: '#EF4444',
    success: '#10B981',
    calm: '#A8C3A8',
  }
};

export type MoodType = keyof typeof MOOD_COLORS;
