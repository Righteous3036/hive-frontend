import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationProvider } from "../components/NotificationContext";
import { ThemeProvider } from "../components/ThemeContext";
import { getStoredUser, User, UserProvider } from "../components/UserContext";
import api, { clearToken, getToken, loadToken } from "../components/api";
import FloatingBee from "../components/ui/FloatingBee";
import { Palette, Radii, Shadows } from "../constants/theme";

import AdminDashboardScreen from "../screens/Admin/AdminDashboardScreen";
import AIMatchingScreen from "../screens/Auth/AIMatchingScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import CreateGroupScreen from "../screens/Groups/CreateGroupScreen";
import GroupChatScreen from "../screens/Groups/GroupChatScreen";
import GroupDetailsScreen from "../screens/Groups/GroupDetailsScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import MyGroupsScreen from "../screens/Home/MyGroupsScreen";
import NotificationsScreen from "../screens/Home/NotificationsScreen";
import ProfileScreen from "../screens/Home/ProfileScreen";
import SavedScreen from "../screens/Home/SavedScreen";
import SettingsScreen from "../screens/Home/SettingsScreen";
import WelcomeScreen from "../screens/WelcomeScreen";

const Stack = createStackNavigator();

// ─────────────────────────────────────────────────────────────
// ANIMATED BRANDED SPLASH SCREEN
// ─────────────────────────────────────────────────────────────
function AnimatedSplashScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const haloAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in content smoothly
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Infinite breathing glow loop
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(haloAnim, {
            toValue: 0.85,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(haloAnim, {
            toValue: 0.35,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [fadeAnim, haloAnim, pulseAnim]);

  return (
    <LinearGradient
      colors={[Palette.primary, Palette.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={splashStyles.container}
    >
      <Animated.View
        style={[splashStyles.content, { opacity: fadeAnim }]}
      >
        <View style={splashStyles.logoWrapper}>
          {/* Ambient glowing halo */}
          <Animated.View
            style={[
              splashStyles.halo,
              {
                opacity: haloAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          {/* Badge with FloatingBee */}
          <View style={splashStyles.badge}>
            <FloatingBee size={44} />
          </View>
        </View>

        <Text style={splashStyles.title}>Hive</Text>
        <Text style={splashStyles.tagline}>
          Connect • Discover • Thrive
        </Text>

        <View style={splashStyles.loaderRow}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={splashStyles.loadingText}>Loading campus hubs...</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoWrapper: {
    position: "relative",
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  halo: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...Shadows.primaryGlow,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    letterSpacing: 0.4,
    marginBottom: 36,
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});

// ─────────────────────────────────────────────────────────────
// SMOOTH FLUID TRANSITIONS FOR TAB & SCREEN NAVIGATION
// ─────────────────────────────────────────────────────────────
const fluidTransitionSpec: any = {
  open: {
    animation: "timing",
    config: {
      duration: 260,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
  },
  close: {
    animation: "timing",
    config: {
      duration: 220,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
  },
};

/**
 * Custom Fluid Slide-and-Fade Interpolator:
 * Replaces harsh page flips or abrupt 100% stack slides with an elegant,
 * subtle horizontal offset (15%) + progressive opacity fade for a seamless,
 * high-end mobile app feel across tabs.
 */
const forFluidFadeSlide = ({
  current,
  next,
  layouts: { screen },
}: any) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0
  );

  const opacity = progress.interpolate({
    inputRange: [0, 0.45, 1, 1.55, 2],
    outputRange: [0, 0.75, 1, 0.75, 0],
    extrapolate: "clamp",
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [screen.width * 0.12, 0, -screen.width * 0.08],
    extrapolate: "clamp",
  });

  return {
    cardStyle: {
      opacity,
      transform: [{ translateX }],
    },
  };
};

export default function AppNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>("Welcome");
  const [restoredUser, setRestoredUser] = useState<User | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        await loadToken();
        const token = getToken();
        if (token) {
          // Check cached user in storage first for fast startup
          const cachedUser = await getStoredUser();
          if (cachedUser) {
            setRestoredUser(cachedUser);
            setInitialRoute(
              cachedUser.role === "admin" ? "AdminDashboard" : "Home",
            );
          }

          // Verify token and fetch fresh profile from API
          try {
            const res = await api.get("/users/profile");
            if (res.data.success && res.data.user) {
              const u = res.data.user;
              const fullUser: User = {
                id: u.id,
                name: u.name,
                email: u.email,
                student_id: u.student_id,
                department: u.department,
                level: u.level,
                role: u.role,
                bio: u.bio || "",
                profile_color: u.profile_color || "#00467F",
                profile_picture: u.profile_picture || null,
                cover_photo: u.cover_photo || null,
                token,
              };
              setRestoredUser(fullUser);
              setInitialRoute(u.role === "admin" ? "AdminDashboard" : "Home");
            }
          } catch (err: any) {
            // If token expired (401), clear token and revert to Welcome
            if (err.response?.status === 401) {
              clearToken();
              setRestoredUser(null);
              setInitialRoute("Welcome");
            }
          }
        }
      } catch (err) {
        console.log("Auth init error:", err);
      } finally {
        setIsReady(true);
      }
    }

    initAuth();
  }, []);

  if (!isReady) {
    return <AnimatedSplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider initialUser={restoredUser}>
          <NotificationProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                  headerShown: false,
                  animationEnabled: true,
                  cardStyle: { flex: 1, backgroundColor: "#0B0F19" },
                  cardShadowEnabled: false,
                  cardOverlayEnabled: false,
                  transitionSpec: fluidTransitionSpec,
                  cardStyleInterpolator: forFluidFadeSlide,
                  gestureEnabled: Platform.OS === "ios",
                  gestureDirection: "horizontal",
                }}
              >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="AIMatching" component={AIMatchingScreen} />
                <Stack.Screen
                  name="ForgotPassword"
                  component={ForgotPasswordScreen}
                />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen
                  name="GroupDetails"
                  component={GroupDetailsScreen}
                />
                <Stack.Screen
                  name="CreateGroup"
                  component={CreateGroupScreen}
                  options={{
                    cardStyleInterpolator:
                      CardStyleInterpolators.forVerticalIOS,
                    gestureDirection: "vertical",
                  }}
                />
                <Stack.Screen name="GroupChat" component={GroupChatScreen} />
                <Stack.Screen name="MyGroups" component={MyGroupsScreen} />
                <Stack.Screen
                  name="Notifications"
                  component={NotificationsScreen}
                />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen
                  name="AdminDashboard"
                  component={AdminDashboardScreen}
                />
                <Stack.Screen name="Saved" component={SavedScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

