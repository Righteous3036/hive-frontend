import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../components/ThemeContext';
import { UserProvider } from '../components/UserContext';
import { NotificationProvider } from '../components/NotificationContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import GroupDetailsScreen from '../screens/Groups/GroupDetailsScreen';
import CreateGroupScreen from '../screens/Groups/CreateGroupScreen';
import MyGroupsScreen from '../screens/Home/MyGroupsScreen';
import NotificationsScreen from '../screens/Home/NotificationsScreen';
import ProfileScreen from '../screens/Home/ProfileScreen';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import SavedScreen from '../screens/Home/SavedScreen';
import SettingsScreen from '../screens/Home/SettingsScreen';
import AIMatchingScreen from '../screens/Auth/AIMatchingScreen';
import GroupChatScreen from '../screens/Groups/GroupChatScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
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
                }}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
                <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
                <Stack.Screen name="MyGroups" component={MyGroupsScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
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