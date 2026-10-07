import React, { useRef } from 'react';
import {
  View, Animated, TouchableWithoutFeedback,
  StyleSheet, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import { useResponsive } from './useResponsive';
import { useSidebar } from './SidebarContext';
import DrawerContent from './DrawerContent';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';
import WebHeader from './WebHeader';
import BottomTabBar from './BottomTabBar';
import ScreenTransition from './ui/ScreenTransition';
import { Layout } from '../constants/theme';

const MOBILE_DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 320);
const WEB_SIDEBAR_WIDTH = Layout.sidebarWidth; // 260

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
  const { isSidebarVisible, toggleSidebar, closeSidebar } = useSidebar();

  // Mobile drawer animation refs
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const mobileDrawerX = useRef(new Animated.Value(-MOBILE_DRAWER_WIDTH)).current;
  const mobileOverlayOpacity = useRef(new Animated.Value(0)).current;

  // Web sidebar animation refs
  const webSidebarX = useRef(new Animated.Value(-WEB_SIDEBAR_WIDTH)).current;
  const webOverlayOpacity = useRef(new Animated.Value(0)).current;

  const openMobileDrawer = () => {
    setMobileOpen(true);
    Animated.parallel([
      Animated.spring(mobileDrawerX, { toValue: 0, useNativeDriver: true, tension: 100, friction: 12 }),
      Animated.timing(mobileOverlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeMobileDrawer = () => {
    Animated.parallel([
      Animated.spring(mobileDrawerX, { toValue: -MOBILE_DRAWER_WIDTH, useNativeDriver: true, tension: 100, friction: 12 }),
      Animated.timing(mobileOverlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setMobileOpen(false));
  };

  // Animate web sidebar in/out based on isSidebarVisible
  React.useEffect(() => {
    if (isMobile) return;
    if (isSidebarVisible) {
      Animated.parallel([
        Animated.spring(webSidebarX, { toValue: 0, useNativeDriver: true, tension: 100, friction: 12 }),
        Animated.timing(webOverlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(webSidebarX, { toValue: -WEB_SIDEBAR_WIDTH, useNativeDriver: true, tension: 100, friction: 12 }),
        Animated.timing(webOverlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isSidebarVisible, isMobile, webSidebarX, webOverlayOpacity]);

  // Determine if the screen is the Create screen or flow where tab bar should be hidden
  const isCreateScreen =
    hideBottomTab ||
    activeScreen === 'Create Group' ||
    activeScreen === 'Create' ||
    activeScreen === 'CreateGroup' ||
    title === 'Create Group' ||
    title === 'Create';

  // Web — collapsible sidebar with WebHeader
  if (!isMobile) {
    return (
      <View style={[styles.webRoot, { backgroundColor: theme.bg }]}>
        {/* WebHeader with hamburger toggle */}
        <WebHeader
          title={title}
          navigation={navigation}
          showBack={showBack}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={toggleSidebar}
        />

        {/* Main content takes full width */}
        <View style={styles.webContentArea}>
          <ScreenTransition key={activeScreen || title}>
            {children}
          </ScreenTransition>
        </View>

        {/* Overlay backdrop when sidebar is open */}
        {isSidebarVisible && (
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <Animated.View style={[styles.webOverlay, { opacity: webOverlayOpacity }]} />
          </TouchableWithoutFeedback>
        )}

        {/* Sliding sidebar drawer */}
        <Animated.View style={[
          styles.webSidebar,
          {
            width: WEB_SIDEBAR_WIDTH,
            backgroundColor: theme.sidebarBg,
            transform: [{ translateX: webSidebarX }],
          },
        ]}>
          <Sidebar navigation={navigation} activeScreen={activeScreen} />
        </Animated.View>
      </View>
    );
  }

  // Mobile — sliding drawer with persistent bottom tab bar (hidden on Create screen)
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={[styles.mobileRoot, { backgroundColor: theme.bg }]}>
        <MobileHeader
          title={title}
          onMenuPress={openMobileDrawer}
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

        {mobileOpen && (
          <TouchableWithoutFeedback onPress={closeMobileDrawer}>
            <Animated.View style={[styles.overlay, { opacity: mobileOverlayOpacity }]} />
          </TouchableWithoutFeedback>
        )}

        <Animated.View style={[
          styles.drawer,
          { width: MOBILE_DRAWER_WIDTH, backgroundColor: theme.sidebarBg, transform: [{ translateX: mobileDrawerX }] },
        ]}>
          <DrawerContent navigation={navigation} activeScreen={activeScreen} onClose={closeMobileDrawer} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  // Web layout: vertical stack (header on top, content below)
  webRoot: { flex: 1, flexDirection: 'column' },
  webContentArea: { flex: 1 },
  webOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 99,
  },
  webSidebar: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    zIndex: 100,
    elevation: 20,
    ...(Platform.OS === 'web' ? { boxShadow: '4px 0 24px rgba(0,0,0,0.15)' } as any : {}),
  },
  // Mobile layout
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