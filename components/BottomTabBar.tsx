import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';

export interface BottomTabBarProps {
  navigation: any;
  activeScreen?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  screen: string;
}

const TABS: TabItem[] = [
  { id: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home', screen: 'Home' },
  { id: 'Groups', label: 'Groups', icon: 'people-outline', activeIcon: 'people', screen: 'MyGroups' },
  { id: 'Create', label: 'Create', icon: 'add-outline', activeIcon: 'add', screen: 'CreateGroup' },
  { id: 'Settings', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings', screen: 'Settings' },
  { id: 'Profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', screen: 'Profile' },
];

/**
 * Resolves screen name to corresponding tab index (0 - 4)
 */
function getActiveTabIndex(screenName?: string): number {
  if (!screenName) return 0;
  const s = screenName.toLowerCase();
  if (s.includes('home') || s.includes('hive')) return 0;
  if (s.includes('group')) return 1;
  if (s.includes('create')) return 2;
  if (s.includes('setting') || s.includes('pref')) return 3;
  if (s.includes('prof') || s.includes('account')) return 4;
  return 0;
}

export default function BottomTabBar({ navigation, activeScreen }: BottomTabBarProps) {
  const { theme, fontSizes, isDarkMode, backgroundImage } = useTheme();
  const insets = useSafeAreaInsets();

  const activeIndex = getActiveTabIndex(activeScreen);

  // Dynamic Theme Colors for Light & Dark Modes
  const isDark = isDarkMode ?? true;

  const colors = {
    // 1. Full-width dock container background (glassmorphic when custom wallpaper is active)
    dockBarBg: isDark
      ? (backgroundImage ? 'rgba(30, 41, 56, 0.92)' : '#1E2230')
      : (backgroundImage ? 'rgba(255, 255, 255, 0.90)' : '#FFFFFF'),
    dockBarBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : (theme?.border || '#E5E7EB'),
    dockShadowColor: isDark ? '#000000' : '#64748B',
    dockShadowOpacity: isDark ? 0.35 : 0.09,

    // 2. Liquid sliding active bubble pill
    bubbleBg: isDark ? '#FFFFFF' : '#F1F5F9', // Crisp white bubble in dark mode, soft surface pill in light mode
    bubbleBorder: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.08)',
    bubbleShadow: isDark ? '#FFFFFF' : '#000000',
    bubbleShadowOpacity: isDark ? 0.3 : 0.08,

    // 3. Tab text & icons with sharp contrast
    activeContent: '#0F111A', // Dark text and icon for maximum clarity
    inactiveContent: isDark ? '#8F9CAE' : (theme?.textSecondary || '#334155'), // Rich slate in light mode
  };

  // Safe bottom edge padding (covers iPhone home bar and Android nav bar)
  const bottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 18 : 8);

  // Bar measurement
  const [barWidth, setBarWidth] = useState<number>(0);
  const horizontalPadding = 4;
  const tabWidth = barWidth > 0 ? (barWidth - horizontalPadding * 2) / TABS.length : 0;
  const bubbleWidth = tabWidth > 0 ? Math.max(tabWidth - 6, 44) : 0;

  // Liquid motion animated values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const stretchAnim = useRef(new Animated.Value(1)).current;
  const squashAnim = useRef(new Animated.Value(1)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;

  // Per-tab icon float / pop animations
  const tabScaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;

  const prevIndexRef = useRef(activeIndex);

  // Measure tab container dynamically
  const handleBarLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== barWidth) {
      setBarWidth(width);
      const initialTabW = (width - horizontalPadding * 2) / TABS.length;
      slideAnim.setValue(activeIndex * initialTabW + 3);
    }
  };

  // Perform liquid gliding transition when active tab changes
  useEffect(() => {
    if (tabWidth <= 0) return;

    const targetX = activeIndex * tabWidth + 3;
    prevIndexRef.current = activeIndex;

    // Trigger haptic touch feedback
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}

    // Micro pop animation for active tab icon
    Animated.sequence([
      Animated.timing(tabScaleAnims[activeIndex], {
        toValue: 1.18,
        duration: 130,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(tabScaleAnims[activeIndex], {
        toValue: 1.0,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();

    // Liquid spring glide physics with directional stretch & squash
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: targetX,
        damping: 17,
        stiffness: 170,
        mass: 0.85,
        useNativeDriver: true,
      }),
      // Horizontal stretch (fluid droplet effect)
      Animated.sequence([
        Animated.timing(stretchAnim, {
          toValue: 1.14,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(stretchAnim, {
          toValue: 1.0,
          damping: 13,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]),
      // Vertical squash (volume preservation)
      Animated.sequence([
        Animated.timing(squashAnim, {
          toValue: 0.90,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(squashAnim, {
          toValue: 1.0,
          damping: 13,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeIndex, tabWidth, slideAnim, stretchAnim, squashAnim, tabScaleAnims]);

  const handleTabPress = (tab: TabItem, index: number) => {
    if (index === activeIndex) return;

    // Small press feedback on bubble
    Animated.sequence([
      Animated.timing(bubbleScale, {
        toValue: 0.94,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(bubbleScale, {
        toValue: 1.0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate(tab.screen);
  };

  return (
    <View
      style={[
        styles.dockWrapper,
        {
          backgroundColor: colors.dockBarBg,
          borderTopColor: colors.dockBarBorder,
          shadowColor: colors.dockShadowColor,
          shadowOpacity: colors.dockShadowOpacity,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {/* Inner Tab Bar Row Container */}
      <View style={styles.dockBar} onLayout={handleBarLayout}>
        {/* Animated Sliding Liquid Bubble Container */}
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.liquidBubble,
              {
                width: bubbleWidth,
                left: horizontalPadding,
                backgroundColor: colors.bubbleBg,
                borderColor: colors.bubbleBorder,
                borderWidth: isDark ? 0 : 1,
                shadowColor: colors.bubbleShadow,
                shadowOpacity: colors.bubbleShadowOpacity,
                transform: [
                  { translateX: slideAnim },
                  { scaleX: stretchAnim },
                  { scaleY: squashAnim },
                  { scale: bubbleScale },
                ],
              },
            ]}
          >
            {/* Subtle top gloss accent on the bubble */}
            <View
              style={[
                styles.bubbleGloss,
                { opacity: isDark ? 1 : 0.4 },
              ]}
            />
          </Animated.View>
        )}

        {/* Tab Items Row */}
        <View style={styles.tabRow}>
          {TABS.map((tab, idx) => {
            const isActive = idx === activeIndex;

            return (
              <Pressable
                key={tab.id}
                style={styles.tabBtn}
                onPress={() => handleTabPress(tab, idx)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <Animated.View
                  style={[
                    styles.tabContent,
                    { transform: [{ scale: tabScaleAnims[idx] }] },
                  ]}
                >
                  {/* Tab Icon */}
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={tab.id === 'Create' ? 24 : 21}
                      color={isActive ? colors.activeContent : colors.inactiveContent}
                    />
                  </View>

                  {/* Clean Floating Label */}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tabLabel,
                      {
                        fontSize: fontSizes?.xs || 11,
                        color: isActive ? colors.activeContent : colors.inactiveContent,
                        fontWeight: isActive ? '800' : '600',
                        opacity: isActive ? 1 : 0.85,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Outer Dock positioning wrapper: stretches full width to bottom screen edge
  dockWrapper: {
    width: '100%',
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 10,
  },
  // Tab Bar Row Container
  dockBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'relative',
  },
  // Liquid Sliding Bubble Container
  liquidBubble: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  // Internal gloss gradient sheen
  bubbleGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  // Tabs Layout
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  tabBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Clean Floating Label
  tabLabel: {
    marginTop: 2,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  // Badge Styles
  badge: {
    position: 'absolute',
    top: -3,
    right: -7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
});