// Premium color palette for wedding/engagement app
export const Colors = {
  light: {
    // Primary - Rose Gold
    primary: '#B76E79',
    primaryLight: '#D4A5A5',
    primaryDark: '#8B4D57',
    
    // Secondary - Soft Gold
    secondary: '#D4AF37',
    secondaryLight: '#E8D48B',
    secondaryDark: '#A8891C',
    
    // Background
    background: '#FDFBF9',
    surface: '#FFFFFF',
    surfaceVariant: '#F8F4F0',
    
    // Text
    text: '#2D2D2D',
    textSecondary: '#6B6B6B',
    textMuted: '#9B9B9B',
    
    // Accent
    accent: '#7B8D8E',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    
    // Borders
    border: '#E8E4E0',
    borderLight: '#F0EDE9',
    
    // Tab bar
    tabIconDefault: '#9B9B9B',
    tabIconSelected: '#B76E79',
  },
  dark: {
    // Primary - Rose Gold
    primary: '#D4A5A5',
    primaryLight: '#E8C4C4',
    primaryDark: '#B76E79',
    
    // Secondary - Soft Gold
    secondary: '#E8D48B',
    secondaryLight: '#F5E9B8',
    secondaryDark: '#D4AF37',
    
    // Background
    background: '#1A1A1C',
    surface: '#2D2D30',
    surfaceVariant: '#3D3D40',
    
    // Text
    text: '#FDFBF9',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    
    // Accent
    accent: '#A8B5B6',
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    
    // Borders
    border: '#404040',
    borderLight: '#505050',
    
    // Tab bar
    tabIconDefault: '#808080',
    tabIconSelected: '#D4A5A5',
  },
};

export type ColorScheme = keyof typeof Colors;
