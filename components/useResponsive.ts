import { useWindowDimensions, Platform } from 'react-native';
import { Layout } from '../constants/theme';

/**
 * Responsive breakpoints hook.
 *
 * - isMobile:  native OR web < 768px
 * - isTablet:  web 768–1024px
 * - isDesktop: web > 1024px
 * - columns:   1 (mobile), 2 (tablet), 3 (desktop) — for grid layouts
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
  const isWeb = Platform.OS === 'web';

  const isMobile = isNative || width < 768;
  const isTablet = isWeb && width >= 768 && width < 1024;
  const isDesktop = isWeb && width >= 1024;

  // Compute optimal grid columns
  const columns = isMobile ? 1 : isTablet ? 2 : 3;

  // Dynamic drawer width — clamp between 280 and 340, never more than 82% of screen
  const drawerWidth = Math.min(Math.max(width * 0.82, 280), 340);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isWeb,
    width,
    height,
    columns,
    drawerWidth,
    padding: isMobile ? 16 : isTablet ? 24 : 28,
    sidebarWidth: Layout.sidebarWidth,
  };
}