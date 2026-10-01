import React, { createContext, useContext, useState } from 'react';
import { Palette } from '../constants/theme';

type FontSizeKey = 'Small' | 'Medium' | 'Large';

export type ThemeColors = {
  // Surfaces
  bg: string;
  card: string;
  surfaceElevated: string;
  sidebarBg: string;
  inputBg: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Borders
  border: string;
  borderLight: string;

  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGlow: string;
  accent: string;
  accentLight: string;

  // Semantic
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;

  // Warm community theme tokens
  amber: string;
  amberLight: string;
  coral: string;
  coralLight: string;
  onlineGreen: string;

  // Legacy aliases (backward-compat)
  subText: string;
};

export type FontSizes = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

type ThemeContextType = {
  isDarkMode: boolean;
  fontSize: FontSizeKey;
  toggleDarkMode: (value: boolean) => void;
  setFontSize: (size: FontSizeKey) => void;
  theme: ThemeColors;
  fontSizes: FontSizes;
};

const light: ThemeColors = {
  // Surfaces
  bg: Palette.gray50,
  card: Palette.white,
  surfaceElevated: Palette.white,
  sidebarBg: Palette.white,
  inputBg: '#F2F4FA',

  // Text — all pass WCAG AA on their respective backgrounds
  text: Palette.gray800,         // #1A1D2E — 14.7:1 on white
  textSecondary: Palette.gray500, // #5F6785 — 5.1:1 on white ✓
  textTertiary: Palette.gray400,  // #8B90A0 — 3.3:1 (large text only)

  // Borders
  border: Palette.gray200,       // #E4E7F0
  borderLight: Palette.gray100,  // #EEF0F6

  // Brand
  primary: Palette.amber,
  primaryDark: Palette.amberDark,
  primaryLight: Palette.amberLight,
  primaryGlow: 'rgba(245, 158, 11, 0.25)',
  accent: Palette.coral,
  accentLight: Palette.coralLight,

  // Semantic
  success: Palette.success,
  successLight: Palette.successLight,
  warning: Palette.warning,
  warningLight: Palette.warningLight,
  error: Palette.error,
  errorLight: Palette.errorLight,

  // Warm tokens
  amber: Palette.amber,
  amberLight: Palette.amberLight,
  coral: Palette.coral,
  coralLight: Palette.coralLight,
  onlineGreen: Palette.onlineGreen,

  // Legacy alias
  subText: Palette.gray500,
};

const dark: ThemeColors = {
  // Surfaces — Deep Navy / Slate dark aesthetic matching reference
  bg: '#0B0F19',
  card: '#1E2938',
  surfaceElevated: '#243044',
  sidebarBg: '#0E1322',
  inputBg: '#182032',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',

  // Borders
  border: '#2A3852',
  borderLight: '#182032',

  // Brand — Warm Amber, Gold & Coral Accents
  primary: '#F59E0B',
  primaryDark: '#D97706',
  primaryLight: 'rgba(245, 158, 11, 0.16)',
  primaryGlow: 'rgba(245, 158, 11, 0.35)',
  accent: '#FF6B6B',
  accentLight: 'rgba(255, 107, 107, 0.16)',

  // Semantic
  success: '#10B981',
  successLight: '#064E3B',
  warning: '#F59E0B',
  warningLight: '#451A03',
  error: '#FF6B6B',
  errorLight: '#450A0A',

  // Warm theme specific tokens
  amber: '#F59E0B',
  amberLight: 'rgba(245, 158, 11, 0.16)',
  coral: '#FF6B6B',
  coralLight: 'rgba(255, 107, 107, 0.16)',
  onlineGreen: '#10B981',

  // Legacy alias
  subText: '#94A3B8',
};

// ALL VALUES ARE NUMBERS — never strings
const fontSizeMap: Record<FontSizeKey, FontSizes> = {
  Small:  { xs: 9,  sm: 11, md: 13, lg: 15, xl: 18, xxl: 22 },
  Medium: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24 },
  Large:  { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 },
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  fontSize: 'Medium',
  toggleDarkMode: () => {},
  setFontSize: () => {},
  theme: dark,
  fontSizes: fontSizeMap['Medium'],
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fontSize, setFontSizeState] = useState<FontSizeKey>('Medium');

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      fontSize,
      toggleDarkMode: setIsDarkMode,
      setFontSize: setFontSizeState,
      theme: isDarkMode ? dark : light,
      fontSizes: fontSizeMap[fontSize],
    }}>
      {children}
    </ThemeContext.Provider>
  );
}