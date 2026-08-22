import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationProvider } from "../components/NotificationContext";
import { ThemeProvider } from "../components/ThemeContext";
import { UserProvider } from "../components/UserContext";

import AdminDashboardScreen from "../screens/Admin/AdminDashboardScreen";
import AIMatchingScreen from "../screens/Auth/AIMatchingScreen";
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

SplashScreen.preventAutoHideAsync();

export default function AppNavigator() {
  const [loaded] = useFonts({
    Ionicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
  });

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                  headerShown: false,
                  cardStyle: { flex: 1 },
                }}
              >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen
                  name="GroupDetails"
                  component={GroupDetailsScreen}
                />
                <Stack.Screen
                  name="CreateGroup"
                  component={CreateGroupScreen}
                />
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
                <Stack.Screen name="AIMatching" component={AIMatchingScreen} />
                <Stack.Screen name="GroupChat" component={GroupChatScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
