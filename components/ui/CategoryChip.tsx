import React, { useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { Radii, Spacing, Shadows } from '../../constants/theme';

type Props = {
  id: string;
  label: string;
  icon?: string;
  emoji?: string;
  color?: string;
  isSelected: boolean;
  onPress: () => void;
};

export default function CategoryChip({
  label,
  icon,
  emoji,
  color,
  isSelected,
  onPress,
}: Props) {
  const { theme, fontSizes } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected ? theme.primary : theme.card,
            borderColor: isSelected ? theme.primary : theme.border,
          },
          isSelected ? Shadows.sm : {},
        ]}
      >
        {emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : icon ? (
          <Ionicons
            name={icon as any}
            size={16}
            color={isSelected ? '#FFFFFF' : color || theme.textSecondary}
            style={styles.icon}
          />
        ) : null}
        <Text
          style={[
            styles.label,
            {
              color: isSelected ? '#FFFFFF' : theme.text,
              fontSize: fontSizes.sm,
              fontWeight: isSelected ? '700' : '500',
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xs + 2,
  },
  emoji: {
    fontSize: 14,
    marginRight: Spacing.xs + 2,
  },
  label: {
    letterSpacing: 0.2,
  },
});
