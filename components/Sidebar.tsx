import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNotifications } from "./NotificationContext";
import { useTheme } from "./ThemeContext";
import { useUser } from "./UserContext";
import { Palette, Shadows, Spacing, Radii, Layout } from "../constants/theme";
import FloatingBee from "./ui/FloatingBee";

const NAV = [
  { icon: "home-outline", activeIcon: "home", label: "Home", screen: "Home" },
  {
    icon: "people-outline",
    activeIcon: "people",
    label: "My Groups",
    screen: "MyGroups",
  },
  {
    icon: "notifications-outline",
    activeIcon: "notifications",
    label: "Notifications",
    screen: "Notifications",
  },
  {
    icon: "bookmark-outline",
    activeIcon: "bookmark",
    label: "Saved",
    screen: "Saved",
  },
  {
    icon: "settings-outline",
    activeIcon: "settings",
    label: "Settings",
    screen: "Settings",
  },
];

type Props = {
  navigation: any;
  activeScreen?: string;
};

export default function Sidebar({ navigation, activeScreen }: Props) {
  const { theme, fontSizes } = useTheme();
  const { user, getInitials, setUser } = useUser();
  const { unreadCount } = useNotifications();
  const [showLogout, setShowLogout] = useState(false);

  const logout = () => {
    setShowLogout(false);
    setUser(null);
    navigation.navigate("Welcome");
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.sidebarBg, borderRightColor: theme.border },
      ]}
    >
      {/* Logo */}
      <View style={styles.logo}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🎓</Text>
        </View>
        <Text
          style={[
            styles.logoText,
            { color: theme.primary, fontSize: fontSizes.md },
          ]}
        >
          Hive
        </Text>
        <FloatingBee size={18} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          {NAV.map((item, i) => {
            const active =
              activeScreen === item.label || activeScreen === item.screen;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.navItem,
                  active && { backgroundColor: theme.primaryLight },
                ]}
                onPress={() => navigation.navigate(item.screen)}
                accessibilityRole="button"
                accessibilityLabel={`Navigate to ${item.label}`}
                accessibilityState={{ selected: active }}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={(active ? item.activeIcon : item.icon) as any}
                    size={20}
                    color={active ? theme.primary : theme.textSecondary}
                  />
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: active ? theme.primary : theme.textSecondary,
                      fontSize: fontSizes.sm,
                    },
                    active && styles.navLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate("CreateGroup")}
          accessibilityRole="button"
          accessibilityLabel="Create a new group"
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={[styles.createBtnText, { fontSize: fontSizes.sm }]}>
            Create Group
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => navigation.navigate("Profile")}
          accessibilityRole="button"
          accessibilityLabel="View your profile"
        >
          {user?.profile_picture ? (
            <Image
              source={{ uri: user.profile_picture }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: user?.profile_color || Palette.primary },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.profileName,
                { color: theme.text, fontSize: fontSizes.sm },
              ]}
            >
              {user?.name || "Student"}
            </Text>
            <Text
              style={[
                styles.profileSub,
                { color: theme.textSecondary, fontSize: fontSizes.xs },
              ]}
            >
              {user?.department || "UG Student"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.errorLight, borderColor: theme.error }]}
          onPress={() => setShowLogout(true)}
          accessibilityRole="button"
          accessibilityLabel="Log out of your account"
        >
          <Ionicons name="log-out-outline" size={20} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error, fontSize: fontSizes.sm }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogout(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: theme.errorLight }]}>
              <Ionicons name="log-out-outline" size={30} color={theme.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Log Out
            </Text>
            <Text style={[styles.modalMsg, { color: theme.textSecondary }]}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancel,
                  { borderColor: theme.border, backgroundColor: theme.inputBg },
                ]}
                onPress={() => setShowLogout(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel logout"
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.textSecondary,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: theme.error }]}
                onPress={logout}
                accessibilityRole="button"
                accessibilityLabel="Confirm logout"
              >
                <Text style={styles.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: Layout.sidebarWidth,
    borderRightWidth: 1,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    flex: 1,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Palette.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 20 },
  logoText: { fontWeight: "800", letterSpacing: 0.3 },
  scroll: { flex: 1 },
  nav: { gap: 4, marginBottom: Spacing.lg },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: Radii.md,
    minHeight: 44,
  },
  iconWrap: { position: "relative" },
  badge: {
    position: "absolute",
    top: -5,
    right: -7,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  navLabel: { fontWeight: "500" },
  navLabelActive: { fontWeight: "700" },
  createBtn: {
    backgroundColor: Palette.primary,
    borderRadius: Radii.md,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: Spacing.lg,
    ...Shadows.primaryGlow,
  },
  createBtnText: { color: "#fff", fontWeight: "700" },
  adminSection: { borderTopWidth: 1, paddingTop: 12, gap: 8, marginBottom: 16 },
  adminLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    paddingHorizontal: 4,
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: Radii.md,
    borderWidth: 1.5,
  },
  adminIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  adminTitle: { fontWeight: "700", color: Palette.primary },
  adminSub: {},
  footer: { borderTopWidth: 1, paddingTop: Spacing.md, gap: 8 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderRadius: Radii.md,
    minHeight: 44,
  },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  profileName: { fontWeight: "600" },
  profileSub: {},
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    minHeight: 44,
  },
  logoutText: { fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    borderRadius: Radii.xl,
    padding: 28,
    width: 300,
    alignItems: "center",
    ...Shadows.lg,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  modalMsg: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  modalBtns: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  modalConfirm: {
    flex: 1,
    height: 48,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
