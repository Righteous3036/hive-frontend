import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../ThemeContext';

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'subtle' | 'primary' | 'accent' | 'card';
};

export default function GradientBackground({ children, style, variant = 'subtle' }: Props) {
  const { isDarkMode, theme } = useTheme();

  const getColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case 'primary':
        return [theme.primary, theme.primaryDark];
      case 'accent':
        return [theme.accent, theme.primary];
      case 'card':
        return isDarkMode
          ? ['#1C2038', '#141728']
          : ['#FFFFFF', '#F8FAFD'];
      case 'subtle':
      default:
        return isDarkMode
          ? ['#0C0E18', '#141728', '#0C0E18']
          : ['#F7F9FD', '#EDF2F9', '#F4F7FC'];
    }
  };

  return (
    <LinearGradient
      colors={getColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
