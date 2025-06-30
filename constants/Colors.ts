export const Colors = {
  primary: '#32E177',
  accent: '#3DB5FF',
  secondary: '#F59E0B',
  secondary: '#F59E0B',
  bgLight: '#F8FDFB',
  bgDark: '#121212',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
  cardBg: '#FFFFFF',
  shadowColor: 'rgba(0, 0, 0, 0.15)',
};

// Onboarding and Login color palettes
export const OnboardingColors = {
  // Slide 1 - Grow Anywhere
  slide1: {
    primary: '#2D7D32',     // Verde bosque
    secondary: '#A5D6A7',   // Verde claro
    accent: '#D7CCC8',      // Terracota suave
    background: 'rgba(232, 245, 232, 0.95)'
  },
  
  // Slide 2 - AI-Powered Care  
  slide2: {
    primary: '#1976D2',     // Azul tech
    secondary: '#4CAF50',   // Verde tech
    accent: '#E3F2FD',      // Azul muy claro
    background: 'rgba(227, 242, 253, 0.95)'
  },
  
  // Slide 3 - Join Community
  slide3: {
    primary: '#388E3C',     // Verde vibrante
    secondary: '#FFC107',   // Amarillo energético
    accent: '#FF7043',      // Naranja cálido
    background: 'rgba(243, 229, 245, 0.95)'
  },
  
  // Slide 4 - Track Success
  slide4: {
    primary: '#2E7D32',     // Verde crecimiento
    secondary: '#FFD700',   // Dorado logro
    accent: '#4CAF50',      // Verde éxito
    background: 'rgba(255, 248, 225, 0.95)'
  },
  
  // Login Screen
  login: {
    primary: '#1B5E20',     // Verde oscuro elegante
    secondary: '#4CAF50',   // Verde medio
    accent: '#81C784',      // Verde claro
    background: 'rgba(232, 245, 232, 0.95)',
    overlay: 'rgba(27, 94, 32, 0.1)'
  }
};

// Typography for onboarding and login
export const OnboardingTypography = {
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
    fontFamily: 'Inter-Bold',
  },
  
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.3,
    fontFamily: 'Inter-Bold',
  },
  
  slideSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.1,
    opacity: 0.8,
    fontFamily: 'Inter-Regular',
  },
  
  loginTitle: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.6,
    fontFamily: 'Inter-Bold',
  }
};

// Hero gradient for Eco Score card
export const heroGradient = ['#32E177', '#28C46A', '#1E9E52'];

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    fontFamily: 'Inter-Bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'Inter-Bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};