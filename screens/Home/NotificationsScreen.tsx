import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../components/api";
import { useNotifications } from "../../components/NotificationContext";
import { useTheme } from "../../components/ThemeContext";
import { useResponsive } from "../../components/useResponsive";
import WithDrawer from "../../components/withDrawer";
import { getCachedGroup } from "../../components/groupCache";

const TYPE_CONFIG: any = {
  join_approved: { icon: "checkmark-circle", color: "#51CF66" },
  join_request: { icon: "person-add", color: "#4C9BE8" },
  announcement: { icon: "megaphone", color: "#FFB347" },
  invitation: { icon: "mail", color: "#845EF7" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "join_approved", label: "Approvals" },
  { id: "announcement", label: "Posts" },
  { id: "invitation", label: "Invites" },
];

export default function NotificationsScreen({ navigation }: any) {
  const { theme, fontSizes } = useTheme();
  const { isMobile, padding } = useResponsive();
  const { refreshUnread } = useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      if (res.data.success) setNotifications(res.data.notifications);
    } catch (err) {
      console.log("Notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      refreshUnread();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      refreshUnread();
    } catch {}
  };

  const deleteNotif = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      refreshUnread();
    } catch {}
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.is_read;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <WithDrawer
      navigation={navigation}
      activeScreen="Notifications"
      title="Notifications"
    >
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.bg }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00467F"
            colors={["#00467F"]}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: padding }]}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.title,
                { color: theme.text, fontSize: fontSizes.xxl },
              ]}
            >
              Notifications
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.subText, fontSize: fontSizes.sm },
              ]}
            >
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You are all caught up!"}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <Ionicons
                name="checkmark-done-outline"
                size={16}
                color="#00467F"
              />
              {!isMobile && (
                <Text style={styles.markAllText}>Mark all read</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterRow,
            { paddingHorizontal: padding },
          ]}
          style={styles.filterScroll}
        >
          {FILTERS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterTab,
                { borderColor: theme.border },
                activeFilter === tab.id && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tab.id)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: theme.subText, fontSize: fontSizes.xs },
                  activeFilter === tab.id && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {tab.id === "unread" && unreadCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <View style={[styles.list, { paddingHorizontal: padding }]}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#00467F" />
              <Text style={[styles.centerText, { color: theme.subText }]}>
                Loading notifications...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="notifications-off-outline" size={54} color={theme.subText} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No notifications
              </Text>
              <Text style={[styles.centerText, { color: theme.subText }]}>
                {activeFilter === "unread"
                  ? "No unread notifications"
                  : "Nothing here yet"}
              </Text>
            </View>
          ) : (
            filtered.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: notif.is_read ? theme.card : theme.inputBg,
                    borderColor: notif.is_read ? theme.border : "#C5D8FF",
                  },
                ]}
                onPress={() => markRead(notif.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.cardIcon,
                    {
                      backgroundColor:
                        (TYPE_CONFIG[notif.type]?.color || "#888") + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      (TYPE_CONFIG[notif.type]?.icon ||
                        "notifications-outline") as any
                    }
                    size={22}
                    color={TYPE_CONFIG[notif.type]?.color || "#888"}
                  />
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text
                      style={[
                        styles.cardTitle,
                        {
                          color: notif.is_read ? theme.subText : theme.text,
                          fontSize: fontSizes.sm,
                        },
                        !notif.is_read && { fontWeight: "bold" },
                      ]}
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    {!notif.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text
                    style={[
                      styles.cardMsg,
                      { color: theme.subText, fontSize: fontSizes.xs },
                    ]}
                    numberOfLines={2}
                  >
                    {notif.message}
                  </Text>
                  <Text
                    style={[
                      styles.cardTime,
                      { color: theme.subText, fontSize: fontSizes.xs },
                    ]}
                  >
                    {formatDate(notif.created_at)}
                  </Text>
                  {(notif.type === "join_approved" ||
                    notif.type === "join_request") &&
                    notif.group_id && (
                      <TouchableOpacity
                        style={styles.viewBtn}
                        onPress={() =>
                          navigation.navigate("GroupDetails", {
                            groupId: notif.group_id,
                            initialGroup: getCachedGroup(notif.group_id),
                          })
                        }
                      >
                        <Text style={styles.viewBtnText}>
                          {notif.type === "join_request"
                            ? "Review Request"
                            : "View Group"}
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={12}
                          color="#00467F"
                        />
                      </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteNotif(notif.id)}
                >
                  <Ionicons name="close" size={16} color={theme.subText} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </WithDrawer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  title: { fontWeight: "bold", marginBottom: 2 },
  subtitle: {},
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#00467F",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllText: { color: "#00467F", fontSize: 12, fontWeight: "600" },
  filterScroll: { marginBottom: 16 },
  filterRow: { gap: 8 },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1.5,
  },
  filterTabActive: { backgroundColor: "#00467F", borderColor: "#00467F" },
  filterTabText: { fontWeight: "500" },
  filterTabTextActive: { color: "#fff" },
  tabBadge: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  tabBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  list: { gap: 10 },
  center: { alignItems: "center", paddingVertical: 60, gap: 12 },
  centerText: { fontSize: 14, textAlign: "center" },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "bold" },
  card: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
    borderWidth: 1,
    elevation: 1,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 4 },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { flex: 1, marginRight: 8 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00467F",
  },
  cardMsg: { lineHeight: 18 },
  cardTime: {},
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  viewBtnText: { color: "#00467F", fontSize: 12, fontWeight: "600" },
  deleteBtn: { padding: 4 },
});
