export const theme = {
  colors: {
    // Background
    bgDeep: '#0D0505',
    bgPrimary: '#150A0A',
    bgCard: '#1F0F0F',
    bgCardHover: '#2A1515',
    bgSurface: '#2E1818',
    bgElevated: '#3A1E1E',

    // Accent - Orange / Gold
    accent: '#FF8C00',
    accentLight: '#FFB347',
    accentGlow: 'rgba(255, 140, 0, 0.4)',
    accentSubtle: 'rgba(255, 179, 71, 0.15)',

    // Accent - Maroon
    red: '#800000',
    redLight: '#A52A2A',
    redSubtle: 'rgba(128, 0, 0, 0.15)',

    // Accent - Emerald
    green: '#10B981',
    greenLight: '#34D399',
    greenSubtle: 'rgba(16, 185, 129, 0.12)',

    // Accent - Sky
    blue: '#3B82F6',
    blueLight: '#60A5FA',
    blueSubtle: 'rgba(59, 130, 246, 0.12)',

    // Text
    textPrimary: '#F5F0E8',
    textSecondary: '#A8A0B8',
    textMuted: '#6B6580',
    textAccent: '#F4A623',

    // Border
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
    borderAccent: 'rgba(232, 117, 26, 0.3)',
  },
  
  typography: {
    fontPrimary: 'System', // Outfit can be loaded later, using System for MVP
    fontSecondary: 'System',
  },

  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 6,
    },
    glow: {
      shadowColor: '#FF8C00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 30,
      elevation: 8,
    }
  }
};
