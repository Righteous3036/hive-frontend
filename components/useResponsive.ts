import { useWindowDimensions, Platform } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android' || width < 768;
  const isWeb = Platform.OS === 'web';

  return {
    isMobile,
    isWeb,
    width,
    height,
    padding: isMobile ? 16 : 28,
  };
}