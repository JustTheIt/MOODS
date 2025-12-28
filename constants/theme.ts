export const MOOD_COLORS = {
  happy: {
    primary: '#FFD700', // Gold
    secondary: '#FFFacd', // LemonChiffon
    gradient: ['#FFD700', '#FFA500'] as const,
    text: '#5c4d00',
    glow: 'rgba(255, 215, 0, 0.6)',
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
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    tabBar: '#1A1A1A',
  },
  light: {
    background: '#FAFAFA',
    card: '#FFFFFF',
    text: '#121212',
    textSecondary: '#666666',
    border: '#E0E0E0',
    tabBar: '#FFFFFF',
  }
};

export type MoodType = keyof typeof MOOD_COLORS;
