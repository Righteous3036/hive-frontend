import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import PrimaryButton from './PrimaryButton';
import { Radii, Spacing } from '../../constants/theme';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export default function EmptyState({
  icon = 'search-outline',
  title,
  description,
  actionTitle,
  onAction,
  style,
}: Props) {
  const { theme, fontSizes } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.primaryLight, borderColor: theme.borderLight },
        ]}
      >
        <Ionicons name={icon} size={36} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSizes.lg }]}>
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.description,
            { color: theme.textSecondary, fontSize: fontSizes.sm },
          ]}
        >
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <PrimaryButton
          title={actionTitle}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 160,
  },
});
