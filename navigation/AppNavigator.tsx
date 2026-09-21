import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationProvider } from "../components/NotificationContext";
import { ThemeProvider } from "../components/ThemeContext";
import { getStoredUser, User, UserProvider } from "../components/UserContext";
import api, { clearToken, getToken, loadToken } from "../components/api";

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
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#00467F",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
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
                  cardStyle: { flex: 1 },
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
