/**
 * Hive Design Tokens
 * Centralized design system — all visual constants in one place.
 * Every component should reference these tokens instead of hardcoding values.
 */

import { Platform } from 'react-native';

// ─── COLOR PALETTE ──────────────────────────────────────────────────────────

export const Palette = {
  // Primary — vivid blue
  primary: '#0A5DA6',
  primaryDark: '#083D6E',
  primaryLight: '#E8F1FD',
  primaryGlow: 'rgba(10, 93, 166, 0.25)',

  // Accent — purple
  accent: '#7C5CFC',
  accentLight: '#EEEBFF',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F7F8FC',
  gray100: '#EEF0F6',
  gray200: '#E4E7F0',
  gray300: '#CDD1DC',
  gray400: '#8B90A0',
  gray500: '#5F6785',
  gray600: '#3D4258',
  gray700: '#2A2E3F',
  gray800: '#1A1D2E',
  gray900: '#0F111A',

  // Semantic
  success: '#34C759',
  successLight: '#E8F5E9',
  warning: '#F5A623',
  warningLight: '#FFF8E1',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Dark Slate & Warm Amber/Coral theme tokens (Reference Theme)
  darkNavy: '#0B0F19',
  slateNavy: '#0E1322',
  cardDark: '#1E2938',
  cardDarkElevated: '#243044',
  cardBorderDark: '#2A3852',
  amber: '#F59E0B',
  amberDark: '#D97706',
  amberLight: 'rgba(245, 158, 11, 0.16)',
  coral: '#FF6B6B',
  coralDark: '#E11D48',
  coralLight: 'rgba(255, 107, 107, 0.16)',
  onlineGreen: '#10B981',

  // Category colors
  study: '#4C9BE8',
  sports: '#34C759',
  tech: '#7C5CFC',
  arts: '#EF4444',
  dance: '#EC4899',
  business: '#F5A623',
  health: '#10B981',
  social: '#F97316',
} as const;

// ─── SPACING (4px grid) ─────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

// ─── BORDER RADII ───────────────────────────────────────────────────────────

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── SHADOWS ────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  /** Colored glow for primary CTA buttons */
  primaryGlow: {
    shadowColor: '#0A5DA6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Colored glow for accent elements */
  accentGlow: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  /** Warm amber glow for FAB and buttons */
  amberGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Warm coral glow for badges and like actions */
  coralGlow: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// ─── TYPOGRAPHY ─────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ─── ANIMATION ──────────────────────────────────────────────────────────────

export const Durations = {
  fast: 150,
  normal: 250,
  slow: 400,
  entrance: 600,
} as const;

// ─── LAYOUT ─────────────────────────────────────────────────────────────────

export const Layout = {
  sidebarWidth: 260,
  sidebarCollapsed: 72,
  headerHeight: 56,
  bottomTabHeight: 64,
  maxContentWidth: 1200,
  minTouchTarget: 44,
} as const;

// ─── LEGACY EXPORTS (for backward compatibility) ────────────────────────────

export const Colors = {
  light: {
    text: Palette.gray800,
    background: Palette.gray50,
    tint: Palette.primary,
    icon: Palette.gray500,
    tabIconDefault: Palette.gray500,
    tabIconSelected: Palette.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: Palette.gray900,
    tint: Palette.white,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: Palette.white,
  },
};
