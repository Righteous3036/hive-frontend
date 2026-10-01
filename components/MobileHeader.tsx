import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationContext';
import { Radii, Shadows, Spacing } from '../constants/theme';
import FloatingBee from './ui/FloatingBee';

type Props = {
  title: string;
  onMenuPress: () => void;
  navigation: any;
  showBack?: boolean;
};

export default function MobileHeader({ title, onMenuPress, navigation, showBack = false }: Props) {
  const { theme, fontSizes, isDarkMode } = useTheme();
  const { user, getInitials } = useUser();
  const { unreadCount } = useNotifications();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDarkMode ? theme.sidebarBg : '#FFFFFF',
          borderBottomColor: theme.border,
        },
        Shadows.sm,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.iconBtn,
          { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.12)' : theme.primaryLight },
        ]}
        onPress={showBack ? () => navigation.goBack() : onMenuPress}
        accessibilityRole="button"
        accessibilityLabel={showBack ? 'Go back' : 'Open menu'}
        activeOpacity={0.7}
      >
        <Ionicons
          name={showBack ? 'arrow-back' : 'menu'}
          size={22}
          color={theme.amber || theme.primary}
        />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        {title === 'Hive 🐝' || title === 'Hive' ? (
          <View style={styles.hiveTitleRow}>
            <Text
              style={[
                styles.title,
                { color: theme.amber || theme.primary, fontSize: fontSizes.lg + 1 },
              ]}
            >
              HIVE
            </Text>
            <FloatingBee size={20} />
          </View>
        ) : title.includes('🐝') ? (
          <View style={styles.hiveTitleRow}>
            <Text
              style={[
                styles.title,
                { color: theme.amber || theme.primary, fontSize: fontSizes.lg + 1 },
              ]}
              numberOfLines={1}
            >
              {title.replace('🐝', '').trim().toUpperCase()}
            </Text>
            <FloatingBee size={20} />
          </View>
        ) : (
          <Text
            style={[
              styles.title,
              { color: theme.amber || theme.primary, fontSize: fontSizes.lg + 1 },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.12)' : theme.primaryLight },
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
            name={unreadCount > 0 ? "notifications" : "notifications-outline"}
            size={20}
            color={theme.amber || theme.primary}
          />
          {unreadCount > 0 && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.coral || '#FF6B6B',
                  borderColor: isDarkMode ? (theme.sidebarBg || '#0E1322') : '#FFFFFF',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  titleContainer: {
    flex: 1,
  },
  hiveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  avatarTouch: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});