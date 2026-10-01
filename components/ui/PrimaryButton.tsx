import React, { useRef, useState } from 'react';
import {
  Animated,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { Radii, Shadows, Spacing } from '../../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
};

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'md',
}: Props) {
  const { theme, fontSizes } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isHovered ? 1.02 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handleHoverIn = () => {
    if (Platform.OS === 'web' && !disabled && !loading) {
      setIsHovered(true);
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        speed: 20,
      }).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      setIsHovered(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md };
      case 'lg':
        return { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl };
      case 'md':
      default:
        return { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return fontSizes.sm;
      case 'lg':
        return fontSizes.lg;
      case 'md':
      default:
        return fontSizes.md;
    }
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  const content = (
    <View style={styles.innerRow}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={
                variant === 'outline' || variant === 'ghost'
                  ? theme.primary
                  : variant === 'secondary'
                  ? theme.text
                  : '#FFFFFF'
              }
              style={{ marginRight: Spacing.sm }}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: getFontSize(),
                color:
                  variant === 'outline' || variant === 'ghost'
                    ? theme.primary
                    : variant === 'secondary'
                    ? theme.text
                    : '#FFFFFF',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={
                variant === 'outline' || variant === 'ghost'
                  ? theme.primary
                  : variant === 'secondary'
                  ? theme.text
                  : '#FFFFFF'
              }
              style={{ marginLeft: Spacing.sm }}
            />
          )}
        </>
      )}
    </View>
  );

  if (variant === 'primary' || variant === 'accent') {
    const gradientColors: readonly [string, string, ...string[]] =
      variant === 'accent'
        ? [theme.accent, theme.primary]
        : [theme.primary, theme.primaryDark];

    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          // @ts-ignore onHoverIn exists in react-native-web
          onHoverIn={handleHoverIn}
          // @ts-ignore onHoverOut exists in react-native-web
          onHoverOut={handleHoverOut}
          disabled={disabled || loading}
          style={[
            styles.buttonWrapper,
            Shadows.primaryGlow,
            isHovered && styles.hoverGlow,
            disabled && styles.disabled,
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, getPadding()]}
          >
            {content}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  const containerStyle: ViewStyle = {
    ...getPadding(),
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      variant === 'secondary'
        ? theme.primaryLight
        : 'transparent',
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderColor: variant === 'outline' ? theme.primary : 'transparent',
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // @ts-ignore onHoverIn exists in react-native-web
        onHoverIn={handleHoverIn}
        // @ts-ignore onHoverOut exists in react-native-web
        onHoverOut={handleHoverOut}
        disabled={disabled || loading}
        style={[containerStyle, disabled && styles.disabled]}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  hoverGlow: {
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  gradient: {
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
