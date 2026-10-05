import React, { useState, useRef } from 'react';
import {
  View, Animated, TouchableWithoutFeedback,
  StyleSheet, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import { useResponsive } from './useResponsive';
import DrawerContent from './DrawerContent';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import ScreenTransition from './ui/ScreenTransition';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 320);

type Props = {
  navigation: any;
  activeScreen: string;
  title: string;
  children: React.ReactNode;
  showBack?: boolean;
  hideBottomTab?: boolean;
};

export default function WithDrawer({
  navigation,
  activeScreen,
  title,
  children,
  showBack = false,
  hideBottomTab = false,
}: Props) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);
  const drawerX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setOpen(true);
    Animated.parallel([
      Animated.spring(drawerX, { toValue: 0, useNativeDriver: true, tension: 100, friction: 12 }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerX, { toValue: -DRAWER_WIDTH, useNativeDriver: true, tension: 100, friction: 12 }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setOpen(false));
  };

  // Determine if the screen is the Create screen or flow where tab bar should be hidden
  const isCreateScreen =
    hideBottomTab ||
    activeScreen === 'Create Group' ||
    activeScreen === 'Create' ||
    activeScreen === 'CreateGroup' ||
    title === 'Create Group' ||
    title === 'Create';

  // Web — fixed sidebar
  if (!isMobile) {
    return (
      <View style={[styles.webRoot, { backgroundColor: theme.bg }]}>
        <Sidebar navigation={navigation} activeScreen={activeScreen} />
        <View style={styles.webContent}>
          <ScreenTransition key={activeScreen || title}>
            {children}
          </ScreenTransition>
        </View>
      </View>
    );
  }

  // Mobile — sliding drawer with persistent bottom tab bar (hidden on Create screen)
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={[styles.mobileRoot, { backgroundColor: theme.bg }]}>
        <MobileHeader
          title={title}
          onMenuPress={openDrawer}
          navigation={navigation}
          showBack={showBack}
        />
        <View style={styles.content}>
          <ScreenTransition key={activeScreen || title}>
            {children}
          </ScreenTransition>
        </View>

        {!isCreateScreen && (
          <BottomTabBar
            navigation={navigation}
            activeScreen={activeScreen}
          />
        )}

        {open && (
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
          </TouchableWithoutFeedback>
        )}

        <Animated.View style={[
          styles.drawer,
          { width: DRAWER_WIDTH, backgroundColor: theme.sidebarBg, transform: [{ translateX: drawerX }] },
        ]}>
          <DrawerContent navigation={navigation} activeScreen={activeScreen} onClose={closeDrawer} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  webRoot: { flexDirection: 'row', flex: 1 },
  webContent: { flex: 1 },
  mobileRoot: { flex: 1 },
  content: { flex: 1 },
  overlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99,
  },
  drawer: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    zIndex: 100, elevation: 20,
  },
});