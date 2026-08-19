import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from './NotificationContext';
import { useTheme } from './ThemeContext';

const tabs = [
  { icon: 'home-outline', activeIcon: 'home', label: 'Home', screen: 'Home' },
  { icon: 'people-outline', activeIcon: 'people', label: 'Groups', screen: 'MyGroups' },
  { icon: 'add-circle-outline', activeIcon: 'add-circle', label: 'Create', screen: 'CreateGroup' },
  { icon: 'notifications-outline', activeIcon: 'notifications', label: 'Alerts', screen: 'Notifications' },
  { icon: 'person-outline', activeIcon: 'person', label: 'Profile', screen: 'Profile' },
];

type Props = {
  navigation: any;
  activeScreen?: string;
};

export default function BottomTabBar({ navigation, activeScreen }: Props) {
  const { unreadCount } = useNotifications();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, {
      backgroundColor: theme.card,
      borderTopColor: theme.border,
    }]}>
      {tabs.map((tab, i) => {
        const isActive = activeScreen === tab.label ||
          (tab.screen === 'Home' && activeScreen === 'Home') ||
          (tab.screen === 'MyGroups' && activeScreen === 'My Groups') ||
          (tab.screen === 'Notifications' && activeScreen === 'Notifications') ||
          (tab.screen === 'Profile' && activeScreen === 'Profile');

        return (
          <TouchableOpacity
            key={i}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.screen)}>

            <View style={styles.iconWrapper}>
              {tab.label === 'Create' ? (
                <View style={styles.createBtn}>
                  <Ionicons name="add" size={26} color="#fff" />
                </View>
              ) : (
                <Ionicons
                  name={(isActive ? tab.activeIcon : tab.icon) as any}
                  size={24}
                  color={isActive ? '#00467F' : theme.subText}
                />
              )}

              {/* Notification Badge */}
              {tab.label === 'Alerts' && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>

            {tab.label !== 'Create' && (
              <Text style={[
                styles.tabLabel,
                { color: isActive ? '#00467F' : theme.subText },
                isActive && { fontWeight: '600' },
              ]}>
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#00467F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#00467F',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});