import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationContext';

type Props = {
  title: string;
  onMenuPress: () => void;
  navigation: any;
  showBack?: boolean;
};

export default function MobileHeader({ title, onMenuPress, navigation, showBack = false }: Props) {
  const { theme, fontSizes } = useTheme();
  const { user, getInitials } = useUser();
  const { unreadCount } = useNotifications();

  return (
    <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <TouchableOpacity style={styles.iconBtn} onPress={showBack ? () => navigation.goBack() : onMenuPress}>
        <Ionicons name={showBack ? 'arrow-back' : 'menu'} size={26} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text, fontSize: fontSizes.lg }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {user?.profile_picture
            ? <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
            : (
              <View style={[styles.avatarFallback, { backgroundColor: user?.profile_color || '#00467F' }]}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, gap: 12,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontWeight: 'bold' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});