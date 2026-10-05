import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from './ThemeContext';

interface AppBackgroundWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  overlayOpacity?: number;
}

export default function AppBackgroundWrapper({
  children,
  style,
  overlayOpacity,
}: AppBackgroundWrapperProps) {
  const { backgroundImage, isDarkMode, theme } = useTheme();

  const solidBackgroundColor = theme.solidBg || (isDarkMode ? '#0B0F19' : '#F8FAFC');

  // If no custom background image, render default solid background
  if (!backgroundImage) {
    return (
      <View style={[styles.container, { backgroundColor: solidBackgroundColor }, style]}>
        {children}
      </View>
    );
  }

  // Determine source: can be an object with uri or required asset
  const imageSource = typeof backgroundImage === 'string'
    ? { uri: backgroundImage }
    : backgroundImage;

  // Soft contrast overlay: maintains wallpaper clarity and colors while providing subtle readability
  const defaultOverlayBg = isDarkMode
    ? 'rgba(11, 15, 25, 0.65)'
    : 'rgba(255, 255, 255, 0.18)';

  return (
    <View style={[styles.container, { backgroundColor: solidBackgroundColor }, style]}>
      <ImageBackground
        source={imageSource}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: defaultOverlayBg,
              opacity: overlayOpacity ?? 1,
            },
          ]}
        />
      </ImageBackground>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
