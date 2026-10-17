import { TextStyle, ViewStyle } from 'react-native';

export const font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

export const colors = {
  primary: '#920012',
  primaryContainer: '#B81D24',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#FFCCC8',
  primaryFixed: '#FFDAD7',
  primaryFixedDim: '#FFB3AD',
  onPrimaryFixed: '#410004',
  onPrimaryFixedVariant: '#930012',
  secondary: '#A23B4A',
  tertiary: '#643C3B',
  surface: '#FCF9F8',
  surfaceContainerLow: '#F6F3F2',
  surfaceContainer: '#F0EDED',
  surfaceContainerHigh: '#EAE7E7',
  surfaceContainerHighest: '#E5E2E1',
  surfaceContainerLowest: '#FFFFFF',
  onSurface: '#1C1B1B',
  onSurfaceVariant: '#5B403E',
  outline: '#8F706D',
  outlineVariant: '#E3BEBE',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  inverseSurface: '#313030',
  inverseOnSurface: '#F3F0EF',
  scrim: 'rgba(26, 26, 26, 0.40)',
  focusRing: 'rgba(146, 0, 18, 0.10)',
  success: '#047857',
  successContainer: '#D1FAE5',
  onSuccessContainer: '#065F46',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  sheet: 24,
  pill: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

export const shadow: Record<string, ViewStyle> = {
  card: {
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  tabBubble: {
    shadowColor: '#B81D24',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modal: {
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
};

export const type: Record<string, TextStyle> = {
  displayMobile: {
    fontFamily: font.bold,
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.68,
  },
  headlineLgMobile: {
    fontFamily: font.bold,
    fontWeight: '700',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.52,
  },
  headlineMd: {
    fontFamily: font.semibold,
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
  },
  headlineSm: {
    fontFamily: font.semibold,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: font.regular,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: font.regular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: font.regular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
  },
  labelLg: {
    fontFamily: font.semibold,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  labelMd: {
    fontFamily: font.semibold,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.24,
  },
  labelSm: {
    fontFamily: font.bold,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.44,
  },
  metric: {
    fontFamily: font.bold,
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.34,
    fontVariant: ['tabular-nums'],
  },
};
