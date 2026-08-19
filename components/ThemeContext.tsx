import React, { createContext, useContext, useState } from 'react';

type FontSizeKey = 'Small' | 'Medium' | 'Large';

export type ThemeColors = {
  bg: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  inputBg: string;
  sidebarBg: string;
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
  bg: '#F5F7FF',
  card: '#ffffff',
  text: '#1a1a2e',
  subText: '#888888',
  border: '#EBEBEB',
  inputBg: '#F7F9FF',
  sidebarBg: '#ffffff',
};

const dark: ThemeColors = {
  bg: '#0f0f1a',
  card: '#1a1a2e',
  text: '#ffffff',
  subText: '#aaaacc',
  border: '#2a2a4a',
  inputBg: '#16213e',
  sidebarBg: '#16213e',
};

// ALL VALUES ARE NUMBERS — never strings
const fontSizeMap: Record<FontSizeKey, FontSizes> = {
  Small:  { xs: 9,  sm: 11, md: 13, lg: 15, xl: 18, xxl: 22 },
  Medium: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24 },
  Large:  { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 },
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  fontSize: 'Medium',
  toggleDarkMode: () => {},
  setFontSize: () => {},
  theme: light,
  fontSizes: fontSizeMap['Medium'],
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
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