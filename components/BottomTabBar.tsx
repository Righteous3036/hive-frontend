import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotifications } from './NotificationContext';
import { useTheme } from './ThemeContext';
import { Radii, Shadows, Spacing } from '../constants/theme';

const tabs = [
  { icon: 'home-outline', activeIcon: 'home', label: 'Home', screen: 'Home' },
  { icon: 'people-outline', activeIcon: 'people', label: 'Groups', screen: 'MyGroups' },
  { icon: 'add', activeIcon: 'add', label: 'Create', screen: 'CreateGroup' },
  { icon: 'notifications-outline', activeIcon: 'notifications', label: 'Alerts', screen: 'Notifications' },
  { icon: 'person-outline', activeIcon: 'person', label: 'Profile', screen: 'Profile' },
];

type Props = {
  navigation: any;
  activeScreen?: string;
};

// ─────────────────────────────────────────────────────────────
// REGULAR TAB BUTTON WITH SPRING PHYSICS
// ─────────────────────────────────────────────────────────────
interface TabButtonProps {
  tab: (typeof tabs)[0];
  isActive: boolean;
  unreadCount: number;
  onPress: () => void;
  theme: any;
  fontSizes: any;
}

function TabButton({
  tab,
  isActive,
  unreadCount,
  onPress,
  theme,
  fontSizes,
}: TabButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const indicatorAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: isActive ? 1 : 0,
      tension: 130,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isActive, indicatorAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      tension: 140,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.tabWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        style={styles.tab}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={tab.label}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name={(isActive ? tab.activeIcon : tab.icon) as any}
            size={22}
            color={isActive ? (theme.amber || theme.primary) : theme.textSecondary}
          />

          {tab.label === 'Alerts' && unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.coral || theme.error }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicator,
              {
                backgroundColor: theme.amber || theme.primary,
                opacity: indicatorAnim,
                transform: [
                  {
                    scaleX: indicatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? (theme.amber || theme.primary) : theme.textSecondary,
              fontWeight: isActive ? '700' : '500',
              fontSize: fontSizes.xs,
            },
          ]}
        >
          {tab.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// CENTER CREATE BUTTON WITH BREATHING PULSE & SPRING BOUNCE
// ─────────────────────────────────────────────────────────────
interface CreateButtonProps {
  onPress: () => void;
  theme: any;
  fontSizes: any;
  isActive: boolean;
}

function CreateButton({ onPress, theme, fontSizes, isActive }: CreateButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle, gentle looping breathing pulse
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.90,
      tension: 140,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      tension: 90,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.createTabWrapper,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
        },
      ]}
    >
      <Pressable
        style={styles.createTab}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Create Group"
      >
        <View style={[styles.createGlow, (Shadows as any).amberGlow || Shadows.primaryGlow]}>
          <LinearGradient
            colors={[theme.amber || '#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? (theme.amber || theme.primary) : theme.textSecondary,
              fontSize: fontSizes.xs,
              marginTop: 2,
              fontWeight: "600",
            },
          ]}
        >
          Create
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function BottomTabBar({ navigation, activeScreen }: Props) {
  const { unreadCount } = useNotifications();
  const { theme, fontSizes, isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? theme.sidebarBg : '#FFFFFF',
          borderTopColor: theme.border,
        },
        Shadows.lg,
      ]}
    >
      <View style={styles.tabRow}>
        {tabs.map((tab, i) => {
          const isActive =
            activeScreen === tab.label ||
            (tab.screen === 'Home' && (activeScreen === 'Home' || activeScreen === 'Hive')) ||
            (tab.screen === 'MyGroups' && (activeScreen === 'My Groups' || activeScreen === 'Groups' || activeScreen === 'MyGroups')) ||
            (tab.screen === 'Notifications' && (activeScreen === 'Notifications' || activeScreen === 'Alerts')) ||
            (tab.screen === 'Profile' && activeScreen === 'Profile');

          if (tab.label === 'Create') {
            return (
              <CreateButton
                key={i}
                onPress={() => navigation.navigate(tab.screen)}
                theme={theme}
                fontSizes={fontSizes}
                isActive={isActive}
              />
            );
          }

          return (
            <TabButton
              key={i}
              tab={tab}
              isActive={isActive}
              unreadCount={unreadCount}
              onPress={() => {
                if (!isActive) {
                  navigation.navigate(tab.screen);
                }
              }}
              theme={theme}
              fontSizes={fontSizes}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 6,
    paddingHorizontal: Spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 4,
    width: '100%',
  },
  createTabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  createTab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  createGlow: {
    borderRadius: Radii.full,
  },
  createGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -3,
    width: 14,
    height: 3,
    borderRadius: 1.5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    marginTop: 2,
    letterSpacing: 0.1,
  },
});