import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationContext';
import { Radii, Shadows, Spacing, Layout } from '../constants/theme';
import FloatingBee from './ui/FloatingBee';

type Props = {
  title: string;
  navigation: any;
  showBack?: boolean;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
};

export default function WebHeader({
  title,
  navigation,
  showBack = false,
  isSidebarVisible,
  onToggleSidebar,
}: Props) {
  const { theme, fontSizes, isDarkMode } = useTheme();
  const { user, getInitials } = useUser();
  const { unreadCount } = useNotifications();

  const isHomeTitle =
    title === 'Hive 🐝' ||
    title === 'Hive' ||
    title === 'HIVE' ||
    title === 'Home';

  const cleanTitle = title.replace('🐝', '').trim();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.sidebarBg || theme.card,
          borderBottomColor: theme.border,
        },
        Shadows.sm,
      ]}
    >
      {/* Left side: Toggle button, back button, and brand/title */}
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(245, 158, 11, 0.12)'
                  : theme.primaryLight,
              },
            ]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.amber || theme.primary}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.iconBtn,
            styles.toggleBtn,
            {
              backgroundColor: isSidebarVisible
                ? (isDarkMode ? 'rgba(245, 158, 11, 0.22)' : theme.primaryLight)
                : (isDarkMode ? 'rgba(245, 158, 11, 0.12)' : theme.primaryLight),
            },
          ]}
          onPress={onToggleSidebar}
          accessibilityRole="button"
          accessibilityLabel={isSidebarVisible ? 'Close sidebar' : 'Open sidebar'}
          activeOpacity={0.7}
        >
          <Ionicons
            name="menu"
            size={22}
            color={theme.amber || theme.primary}
          />
        </TouchableOpacity>

        {/* Brand identity */}
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go to Home"
        >
          <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="school" size={16} color="#FFFFFF" />
          </View>
          <Text
            style={[
              styles.brandText,
              { color: theme.amber || theme.primary, fontSize: fontSizes.lg },
            ]}
          >
            HIVE
          </Text>
          <FloatingBee size={18} />
        </TouchableOpacity>

        {/* Breadcrumb / Page Title if not home */}
        {!isHomeTitle && (
          <View style={styles.breadcrumbRow}>
            <Text style={[styles.separator, { color: theme.subText }]}>/</Text>
            <Text
              style={[
                styles.pageTitle,
                { color: theme.text, fontSize: fontSizes.md },
              ]}
              numberOfLines={1}
            >
              {cleanTitle}
            </Text>
          </View>
        )}
      </View>

      {/* Right side: Notifications & Profile */}
      <View style={styles.right}>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            {
              backgroundColor: isDarkMode
                ? 'rgba(245, 158, 11, 0.12)'
                : theme.primaryLight,
            },
          ]}
          onPress={() => navigation.navigate('Notifications')}
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
            size={20}
            color={theme.amber || theme.primary}
          />
          {unreadCount > 0 && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.coral || '#FF6B6B',
                  borderColor: isDarkMode
                    ? theme.sidebarBg || '#0E1322'
                    : '#FFFFFF',
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="My Profile"
          activeOpacity={0.8}
          style={[
            styles.avatarTouch,
            { borderColor: theme.amber || theme.primary },
          ]}
        >
          {user?.profile_picture ? (
            <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: user?.profile_color || theme.primary },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  toggleBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    fontSize: 16,
    fontWeight: '300',
    opacity: 0.6,
  },
  pageTitle: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  avatarTouch: {
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
