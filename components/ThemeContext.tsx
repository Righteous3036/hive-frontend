import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { Palette } from '../constants/theme';
import { useUser } from './UserContext';
import api from './api';
import { supabase } from './supabase';
import { emitThemeUpdated, THEME_UPDATED_EVENT, ThemeUpdatePayload } from './groupEvents';

type FontSizeKey = 'Small' | 'Medium' | 'Large';

export type ThemeColors = {
  // Surfaces
  bg: string;
  solidBg: string;
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
  backgroundImage: string | null;
  toggleDarkMode: (value: boolean) => void;
  setFontSize: (size: FontSizeKey) => void;
  setBackgroundImage: (uri: string | null) => Promise<void>;
  removeBackgroundImage: () => Promise<void>;
  theme: ThemeColors;
  fontSizes: FontSizes;
};

const light: ThemeColors = {
  // Surfaces
  bg: Palette.gray50,
  solidBg: Palette.gray50,
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
  solidBg: '#0B0F19',
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

const BG_STORAGE_KEY = '@hive_theme_background_image';
const DARK_STORAGE_KEY = '@hive_theme_dark_mode';
const FONT_STORAGE_KEY = '@hive_theme_font_size';

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  fontSize: 'Medium',
  backgroundImage: null,
  toggleDarkMode: () => {},
  setFontSize: () => {},
  setBackgroundImage: async () => {},
  removeBackgroundImage: async () => {},
  theme: dark,
  fontSizes: fontSizeMap['Medium'],
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fontSize, setFontSizeState] = useState<FontSizeKey>('Medium');
  const [backgroundImage, setBackgroundImageState] = useState<string | null>(null);

  // 1. Restore local preferences on initial app load for zero-latency startup
  useEffect(() => {
    (async () => {
      try {
        const [savedDark, savedFont, savedBg] = await Promise.all([
          AsyncStorage.getItem(DARK_STORAGE_KEY),
          AsyncStorage.getItem(FONT_STORAGE_KEY),
          AsyncStorage.getItem(BG_STORAGE_KEY),
        ]);
        if (savedDark !== null) {
          setIsDarkMode(savedDark === 'true');
        }
        if (savedFont === 'Small' || savedFont === 'Medium' || savedFont === 'Large') {
          setFontSizeState(savedFont as FontSizeKey);
        }
        if (savedBg !== null) {
          setBackgroundImageState(savedBg || null);
        }
      } catch (e) {
        console.warn('Failed to load theme preferences from storage:', e);
      }
    })();
  }, []);

  // 2. Database Sync: Whenever user profile loads or changes from server/db, sync theme background
  useEffect(() => {
    if (user && user.theme_background !== undefined) {
      const dbBg = user.theme_background || null;
      if (dbBg !== backgroundImage) {
        setBackgroundImageState(dbBg);
        if (dbBg) {
          AsyncStorage.setItem(BG_STORAGE_KEY, dbBg).catch(() => {});
        } else {
          AsyncStorage.removeItem(BG_STORAGE_KEY).catch(() => {});
        }
      }
    }
  }, [user?.theme_background]);

  // 3. In-App Cross-Component Event Listener (like GROUP_UPDATED_EVENT for instant reactive refresh)
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(THEME_UPDATED_EVENT, (payload: ThemeUpdatePayload) => {
      if (!payload) return;
      if (payload.userId === undefined || !user || payload.userId === user.id) {
        const newBg = payload.theme_background ?? null;
        setBackgroundImageState(newBg);
      }
    });
    return () => {
      sub.remove();
    };
  }, [user?.id]);

  // 4. Supabase Real-Time Channel: Broadcasts & listens to database changes across tabs / devices
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-theme-sync-${user.id}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload?.new && 'theme_background' in payload.new) {
            const remoteBg = payload.new.theme_background || null;
            setBackgroundImageState(remoteBg);
            if (remoteBg) {
              AsyncStorage.setItem(BG_STORAGE_KEY, remoteBg).catch(() => {});
            } else {
              AsyncStorage.removeItem(BG_STORAGE_KEY).catch(() => {});
            }
            if (user) {
              setUser({ ...user, theme_background: remoteBg });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const toggleDarkMode = (value: boolean) => {
    setIsDarkMode(value);
    AsyncStorage.setItem(DARK_STORAGE_KEY, String(value)).catch(() => {});
  };

  const setFontSize = (size: FontSizeKey) => {
    setFontSizeState(size);
    AsyncStorage.setItem(FONT_STORAGE_KEY, size).catch(() => {});
  };

  const setBackgroundImage = async (uri: string | null) => {
    // 1. Optimistic instant state update across all screens
    setBackgroundImageState(uri);

    // 2. Persist locally to AsyncStorage for immediate cold-start availability
    try {
      if (uri) {
        await AsyncStorage.setItem(BG_STORAGE_KEY, uri);
      } else {
        await AsyncStorage.removeItem(BG_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save background image preference:', e);
    }

    // 3. Emit in-app reactive event
    emitThemeUpdated({
      theme_background: uri,
      userId: user?.id,
    });

    // 4. Update user context
    if (user) {
      setUser({ ...user, theme_background: uri });
    }

    // 5. Save to database (backend API + Supabase)
    if (user?.id) {
      try {
        await api.put('/users/profile', { theme_background: uri });
      } catch (e: any) {
        console.warn('Error saving theme background to backend API:', e?.response?.data || e?.message || e);
      }

      try {
        await supabase
          .from('profiles')
          .update({ theme_background: uri })
          .eq('id', user.id);
      } catch (e: any) {
        console.warn('Error syncing theme background to Supabase:', e?.message || e);
      }
    }
  };

  const removeBackgroundImage = async () => {
    await setBackgroundImage(null);
  };

  const activeBase = isDarkMode ? dark : light;
  const currentTheme: ThemeColors = {
    ...activeBase,
    bg: backgroundImage ? 'transparent' : activeBase.bg,
    // Translucent glassmorphism for cards & containers when custom background is set
    card: backgroundImage
      ? (isDarkMode ? 'rgba(30, 41, 56, 0.82)' : 'rgba(255, 255, 255, 0.78)')
      : activeBase.card,
    surfaceElevated: backgroundImage
      ? (isDarkMode ? 'rgba(36, 48, 68, 0.88)' : 'rgba(255, 255, 255, 0.88)')
      : activeBase.surfaceElevated,
    inputBg: backgroundImage
      ? (isDarkMode ? 'rgba(24, 32, 50, 0.78)' : 'rgba(255, 255, 255, 0.80)')
      : activeBase.inputBg,
    sidebarBg: backgroundImage
      ? (isDarkMode ? 'rgba(14, 19, 34, 0.94)' : 'rgba(255, 255, 255, 0.92)')
      : activeBase.sidebarBg,
    border: backgroundImage
      ? (isDarkMode ? 'rgba(42, 56, 82, 0.70)' : 'rgba(215, 222, 235, 0.85)')
      : activeBase.border,
    borderLight: backgroundImage
      ? (isDarkMode ? 'rgba(42, 56, 82, 0.40)' : 'rgba(226, 232, 240, 0.65)')
      : activeBase.borderLight,
    // High contrast typography for light mode
    text: !isDarkMode ? '#0F172A' : activeBase.text,
    textSecondary: !isDarkMode ? '#334155' : activeBase.textSecondary,
    subText: !isDarkMode ? '#334155' : activeBase.subText,
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      fontSize,
      backgroundImage,
      toggleDarkMode,
      setFontSize,
      setBackgroundImage,
      removeBackgroundImage,
      theme: currentTheme,
      fontSizes: fontSizeMap[fontSize],
    }}>
      {children}
    </ThemeContext.Provider>
  );
}