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
  activeScreen: string;
  onClose: () => void;
};

export default function DrawerContent({
  navigation,
  activeScreen,
  onClose,
}: Props) {
  const { theme } = useTheme();
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
    <View style={[styles.root, { backgroundColor: theme.sidebarBg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>🎓</Text>
            <Text style={styles.logoText}>Hive 🐝</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileBox}
          onPress={() => go("Profile")}
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
                { backgroundColor: user?.profile_color || "#4C9BE8" },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Student"}</Text>
            <Text style={styles.profileDept}>
              {user?.department || "UG Student"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="rgba(255,255,255,0.6)"
          />
        </TouchableOpacity>
      </View>

      {/* Nav */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          {NAV.map((item, i) => {
            const active =
              activeScreen === item.label || activeScreen === item.screen;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => go(item.screen)}
              >
                <View style={styles.navIconWrap}>
                  <Ionicons
                    name={(active ? item.activeIcon : item.icon) as any}
                    size={22}
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
                    { color: active ? "#00467F" : theme.subText },
                    active && styles.navLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                {active && <View style={styles.activeBar} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Create Group */}
        <View style={[styles.section, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => go("CreateGroup")}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createBtnText}>Create New Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogout(true)}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Modal */}
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
                  style={[styles.modalCancelText, { color: theme.subText }]}
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
  root: { flex: 1 },
  header: {
    backgroundColor: "#00467F",
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoEmoji: { fontSize: 24 },
  logoText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: "bold", color: "#fff" },
  profileDept: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  scroll: { flex: 1 },
  nav: { padding: 12, gap: 2 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    position: "relative",
  },
  navItemActive: { backgroundColor: "#00467F12" },
  navIconWrap: { position: "relative" },
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
  navLabel: { fontSize: 15, fontWeight: "500", flex: 1 },
  navLabelActive: { fontWeight: "700" },
  activeBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: "#00467F",
  },
  section: { borderTopWidth: 1, padding: 16, gap: 10 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00467F",
    borderRadius: 12,
    height: 48,
  },
  createBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
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
  adminTitle: { fontSize: 13, fontWeight: "700", color: "#00467F" },
  adminSub: { fontSize: 11, marginTop: 1 },
  footer: { borderTopWidth: 1, padding: 16 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  logoutText: { color: "#FF6B6B", fontWeight: "600", fontSize: 14 },
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
  modalCancelText: { fontSize: 14, fontWeight: "600" },
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
