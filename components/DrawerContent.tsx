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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNotifications } from "./NotificationContext";
import { useTheme } from "./ThemeContext";
import { useUser } from "./UserContext";
import { Radii, Shadows, Spacing } from "../constants/theme";
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
  activeScreen: string;
  onClose: () => void;
};

export default function DrawerContent({
  navigation,
  activeScreen,
  onClose,
}: Props) {
  const { theme, fontSizes, isDarkMode } = useTheme();
  const { user, getInitials, setUser } = useUser();
  const { unreadCount } = useNotifications();
  const [showLogout, setShowLogout] = useState(false);

  const go = (screen: string) => {
    onClose();
    setTimeout(() => navigation.navigate(screen), 150);
  };

  const logout = () => {
    setShowLogout(false);
    setUser(null);
    onClose();
    setTimeout(() => navigation.navigate("Welcome"), 150);
  };

  return (
    <View style={[styles.root, { backgroundColor: isDarkMode ? "#141728" : "#FFFFFF" }]}>
      {/* Header with LinearGradient */}
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <FloatingBee size={24} />
            <Text style={styles.logoText}>Hive</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileBox}
          onPress={() => go("Profile")}
          activeOpacity={0.85}
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
                { backgroundColor: user?.profile_color || theme.accent },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.name || "Student"}
            </Text>
            <Text style={styles.profileDept} numberOfLines={1}>
              {user?.department || "Campus Member"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="rgba(255,255,255,0.7)"
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Navigation List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nav}>
          {NAV.map((item, i) => {
            const active =
              activeScreen === item.label || activeScreen === item.screen;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.navItem,
                  active && {
                    backgroundColor: theme.primaryLight,
                  },
                ]}
                onPress={() => go(item.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.navIconWrap}>
                  <Ionicons
                    name={(active ? item.activeIcon : item.icon) as any}
                    size={20}
                    color={active ? theme.primary : theme.textSecondary}
                  />
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: theme.error }]}>
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
                      color: active ? theme.primary : theme.text,
                      fontSize: fontSizes.md,
                      fontWeight: active ? "700" : "500",
                    },
                  ]}
                >
                  {item.label}
                </Text>
                {active && (
                  <View
                    style={[styles.activeBar, { backgroundColor: theme.primary }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Create Group Button */}
        <View style={[styles.section, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => go("CreateGroup")}
            activeOpacity={0.85}
            style={[styles.createBtnWrapper, Shadows.primaryGlow]}
          >
            <LinearGradient
              colors={[theme.primary, theme.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createBtn}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.createBtnText}>Create New Group</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.errorLight, borderColor: theme.error + "40" }]}
          onPress={() => setShowLogout(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={theme.error} />
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
          <View
            style={[
              styles.modalBox,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.lg,
            ]}
          >
            <View
              style={[styles.modalIcon, { backgroundColor: theme.errorLight }]}
            >
              <Ionicons name="log-out-outline" size={32} color={theme.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text, fontSize: fontSizes.xl }]}>
              Log Out
            </Text>
            <Text style={[styles.modalMsg, { color: theme.textSecondary, fontSize: fontSizes.sm }]}>
              Are you sure you want to log out of Hive?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancel,
                  { borderColor: theme.border, backgroundColor: theme.inputBg },
                ]}
                onPress={() => setShowLogout(false)}
              >
                <Text
                  style={[styles.modalCancelText, { color: theme.text, fontSize: fontSizes.sm }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: theme.error }]}
                onPress={logout}
              >
                <Text style={[styles.modalConfirmText, { fontSize: fontSizes.sm }]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoEmoji: { fontSize: 24 },
  logoText: { fontSize: 20, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.5 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  profileDept: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: Spacing.sm },
  nav: { paddingHorizontal: Spacing.md, gap: 4 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radii.md,
    position: "relative",
  },
  navIconWrap: { position: "relative", width: 24, alignItems: "center" },
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  navLabel: { flex: 1 },
  activeBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  section: { borderTopWidth: 1, padding: Spacing.lg, marginTop: Spacing.sm },
  createBtnWrapper: {
    borderRadius: Radii.md,
    overflow: "hidden",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: Radii.md,
  },
  createBtnText: { color: "#FFFFFF", fontWeight: "700" },
  footer: { borderTopWidth: 1, padding: Spacing.lg },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: Radii.md,
    height: 44,
    borderWidth: 1,
  },
  logoutText: { fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  modalBox: {
    borderRadius: Radii.xl,
    padding: Spacing['2xl'],
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    borderWidth: 1,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: { fontWeight: "800", marginBottom: Spacing.xs },
  modalMsg: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modalBtns: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancel: {
    flex: 1,
    height: 44,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  modalCancelText: { fontWeight: "600" },
  modalConfirm: {
    flex: 1,
    height: 44,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: { color: "#FFFFFF", fontWeight: "700" },
});
