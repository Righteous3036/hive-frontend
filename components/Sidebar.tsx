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
      <View style={styles.logo}>
        <Text style={styles.logoEmoji}>🎓</Text>
        <Text
          style={[
            styles.logoText,
            { color: "#00467F", fontSize: fontSizes.md },
          ]}
        >
          Hive
        </Text>
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
                  active && { backgroundColor: theme.inputBg },
                ]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={(active ? item.activeIcon : item.icon) as any}
                    size={20}
                    color={active ? "#00467F" : theme.subText}
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
                      color: active ? "#00467F" : theme.subText,
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
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={[styles.createBtnText, { fontSize: fontSizes.sm }]}>
            Create Group
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => navigation.navigate("Profile")}
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
                { backgroundColor: user?.profile_color || "#00467F" },
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
                { color: theme.subText, fontSize: fontSizes.xs },
              ]}
            >
              {user?.department || "UG Student"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogout(true)}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={[styles.logoutText, { fontSize: fontSizes.sm }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLogout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogout(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={styles.modalIcon}>
              <Ionicons name="log-out-outline" size={30} color="#FF6B6B" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Log Out
            </Text>
            <Text style={[styles.modalMsg, { color: theme.subText }]}>
              Are you sure you want to log out?
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
                  style={[
                    { fontSize: 14, fontWeight: "600" },
                    { color: theme.subText },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={logout}>
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
    width: 240,
    borderRightWidth: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flex: 1,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  logoEmoji: { fontSize: 24 },
  logoText: { fontWeight: "bold" },
  scroll: { flex: 1 },
  nav: { gap: 4, marginBottom: 16 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
  },
  iconWrap: { position: "relative" },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  navLabel: { fontWeight: "500" },
  navLabelActive: { fontWeight: "700" },
  createBtn: {
    backgroundColor: "#00467F",
    borderRadius: 12,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  createBtnText: { color: "#fff", fontWeight: "600" },
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
    borderRadius: 12,
    borderWidth: 1.5,
  },
  adminIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#00467F",
    alignItems: "center",
    justifyContent: "center",
  },
  adminTitle: { fontWeight: "700", color: "#00467F" },
  adminSub: {},
  footer: { borderTopWidth: 1, paddingTop: 12, gap: 8 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderRadius: 10,
  },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  profileName: { fontWeight: "600" },
  profileSub: {},
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  logoutText: { color: "#FF6B6B", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: { borderRadius: 20, padding: 28, width: 300, alignItems: "center" },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  modalMsg: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBtns: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancel: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  modalConfirm: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
  },
  modalConfirmText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
