import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { Radii, Shadows, Spacing } from '../../constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  variant?: 'flat' | 'elevated' | 'glass' | 'outlined';
  activeOpacity?: number;
};

export default function GlassCard({
  children,
  style,
  onPress,
  variant = 'elevated',
  activeOpacity = 0.85,
}: Props) {
  const { theme, isDarkMode } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'glass':
        return isDarkMode ? 'rgba(24, 27, 46, 0.75)' : 'rgba(255, 255, 255, 0.85)';
      case 'outlined':
        return 'transparent';
      case 'flat':
        return theme.card;
      case 'elevated':
      default:
        return theme.card;
    }
  };

  const getBorderColor = () => {
    if (variant === 'glass') {
      return isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)';
    }
    return theme.border;
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    ...(variant === 'elevated' || variant === 'glass' ? Shadows.md : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
