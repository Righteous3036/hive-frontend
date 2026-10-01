import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Radii, Spacing, Shadows } from '../../constants/theme';

type Props = {
  isMobile?: boolean;
  style?: ViewStyle;
};

export default function SkeletonCard({ isMobile = true, style }: Props) {
  const { theme, isDarkMode } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  const boneColor = isDarkMode ? '#282C4A' : '#E2E7F2';
  const cardBg = theme.card;

  return (
    <View
      style={[
        isMobile ? styles.mobileCard : styles.webCard,
        {
          backgroundColor: cardBg,
          borderColor: theme.border,
        },
        Shadows.sm,
        style,
      ]}
    >
      {/* Header Placeholder */}
      <View style={[styles.headerStrip, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.headerLeft}>
          <Animated.View
            style={[
              styles.iconBoxPlaceholder,
              { backgroundColor: boneColor, opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.badgePlaceholder,
              { backgroundColor: boneColor, opacity: pulseAnim },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.bookmarkPlaceholder,
            { backgroundColor: boneColor, opacity: pulseAnim },
          ]}
        />
      </View>

      {/* Content Placeholder */}
      <View style={styles.body}>
        {/* Title */}
        <Animated.View
          style={[
            styles.titlePlaceholder,
            { backgroundColor: boneColor, opacity: pulseAnim },
          ]}
        />

        {/* Description Lines */}
        <Animated.View
          style={[
            styles.descLine1,
            { backgroundColor: boneColor, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.descLine2,
            { backgroundColor: boneColor, opacity: pulseAnim },
          ]}
        />

        {/* Tags */}
        <View style={styles.tagsRow}>
          <Animated.View
            style={[
              styles.tagPill,
              { backgroundColor: boneColor, opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.tagPill,
              { backgroundColor: boneColor, opacity: pulseAnim, width: 60 },
            ]}
          />
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
          <Animated.View
            style={[
              styles.membersPlaceholder,
              { backgroundColor: boneColor, opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.buttonPlaceholder,
              { backgroundColor: boneColor, opacity: pulseAnim },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  webCard: {
    width: '48%',
    minWidth: 300,
    flexGrow: 1,
    borderRadius: Radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBoxPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
  },
  badgePlaceholder: {
    width: 70,
    height: 18,
    borderRadius: Radii.sm,
  },
  bookmarkPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: Radii.sm,
  },
  body: {
    padding: Spacing.md,
  },
  titlePlaceholder: {
    width: '65%',
    height: 20,
    borderRadius: Radii.sm,
    marginBottom: Spacing.md,
  },
  descLine1: {
    width: '95%',
    height: 14,
    borderRadius: 4,
    marginBottom: Spacing.xs + 2,
  },
  descLine2: {
    width: '75%',
    height: 14,
    borderRadius: 4,
    marginBottom: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tagPill: {
    width: 48,
    height: 16,
    borderRadius: Radii.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.sm + 2,
  },
  membersPlaceholder: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  buttonPlaceholder: {
    width: 80,
    height: 28,
    borderRadius: Radii.md,
  },
});
