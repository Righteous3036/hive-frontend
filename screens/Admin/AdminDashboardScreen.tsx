import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useResponsive } from "../../components/useResponsive";
import WithDrawer from "../../components/withDrawer";

export default function AdminDashboardScreen({ navigation }: any) {
  const { theme, fontSizes } = useTheme();
  const { padding } = useResponsive();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [pendingGroups, setPendingGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");

  useEffect(() => {
    fetchData();
    // Refresh every 15 seconds to get real-time updates
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, groupsRes] = await Promise.all([
        api.get("/stats"),
        api.get("/users/all"),
        api.get("/groups/all"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (groupsRes.data.success) {
        const allGroups = groupsRes.data.groups;
        setGroups(allGroups);
        setPendingGroups(allGroups.filter((g: any) => g.status === "pending"));
      }
    } catch (err: any) {
      console.log("Admin fetch error:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  const approveGroup = async (groupId: number) => {
    try {
      await api.put(`/groups/${groupId}/approve`);
      setPendingGroups((prev) => prev.filter((g) => g.id !== groupId));
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, status: "active" } : g)),
      );
    } catch (err) {
      console.log("Approve error:", err);
    }
  };

  const rejectGroup = async (groupId: number) => {
    try {
      await api.put(`/groups/${groupId}/reject`);
      setPendingGroups((prev) => prev.filter((g) => g.id !== groupId));
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err) {
      console.log("Reject error:", err);
    }
  };

  const toggleUserRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "student" : "admin";
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      console.log("Toggle role error:", err);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.log("Delete user error:", err);
    }
  };

  const deleteGroup = async (groupId: number) => {
    try {
      await api.delete(`/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err) {
      console.log("Delete group error:", err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const filteredGroups = groups.filter(
    (g) =>
      g.name?.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.category?.toLowerCase().includes(groupSearch.toLowerCase()),
  );

  const STAT_CARDS = [
    {
      label: "Total Users",
      value: stats?.total_users || 0,
      icon: "people-outline",
      color: "#4C9BE8",
    },
    {
      label: "Total Groups",
      value: stats?.total_groups || 0,
      icon: "apps-outline",
      color: "#51CF66",
    },
    {
      label: "Active Groups",
      value: stats?.active_groups || 0,
      icon: "checkmark-circle-outline",
      color: "#845EF7",
    },
    {
      label: "Pending",
      value: stats?.pending_groups || 0,
      icon: "time-outline",
      color: stats?.pending_groups > 0 ? "#FF6B6B" : "#FFB347",
    },
  ];

  if (loading) {
    return (
      <WithDrawer
        navigation={navigation}
        activeScreen="AdminDashboard"
        title="Admin"
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00467F" />
          <Text style={[styles.centerText, { color: theme.subText }]}>
            Loading dashboard...
          </Text>
        </View>
      </WithDrawer>
    );
  }

  return (
    <WithDrawer
      navigation={navigation}
      activeScreen="AdminDashboard"
      title="Admin Dashboard"
    >
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.bg }]}
        showsVerticalScrollIndicator={false}
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
              Admin Dashboard
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.subText, fontSize: fontSizes.sm },
              ]}
            >
              Manage the Hive platform
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.refreshBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={fetchData}
          >
            <Ionicons name="refresh-outline" size={20} color="#00467F" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsGrid, { paddingHorizontal: padding }]}>
          {STAT_CARDS.map((stat, i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: stat.color + "20" },
                ]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={22}
                  color={stat.color}
                />
              </View>
              <Text
                style={[
                  styles.statValue,
                  { color: theme.text, fontSize: fontSizes.xxl },
                ]}
              >
                {stat.value}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.subText, fontSize: fontSizes.xs },
                ]}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.tabsRow,
            { paddingHorizontal: padding },
          ]}
          style={styles.tabsScroll}
        >
          {[
            { id: "overview", label: "Overview", icon: "grid-outline" },
            { id: "users", label: "Users", icon: "people-outline" },
            { id: "groups", label: "Groups", icon: "apps-outline" },
            { id: "pending", label: "Pending", icon: "time-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabChip,
                activeTab === tab.id && styles.tabChipActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={13}
                color={activeTab === tab.id ? "#fff" : theme.subText}
              />
              <Text
                style={[
                  styles.tabChipText,
                  {
                    color: activeTab === tab.id ? "#fff" : theme.subText,
                    fontSize: fontSizes.xs,
                  },
                ]}
              >
                {tab.label}
              </Text>
              {tab.id === "pending" && pendingGroups.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {pendingGroups.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.tabContent, { paddingHorizontal: padding }]}>
          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <View style={styles.section}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  Platform Summary
                </Text>
                {[
                  { label: "Total Users", value: stats?.total_users || 0 },
                  { label: "Total Groups", value: stats?.total_groups || 0 },
                  { label: "Active Groups", value: stats?.active_groups || 0 },
                  {
                    label: "Pending Groups",
                    value: stats?.pending_groups || 0,
                  },
                  { label: "Total Members", value: stats?.total_members || 0 },
                ].map((item, i, arr) => (
                  <View
                    key={i}
                    style={[
                      styles.summaryRow,
                      { borderBottomColor: theme.border },
                      i < arr.length - 1 && { borderBottomWidth: 1 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: theme.subText, fontSize: fontSizes.sm },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: theme.text, fontSize: fontSizes.md },
                      ]}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>

              {pendingGroups.length > 0 && (
                <TouchableOpacity
                  style={styles.alertBox}
                  onPress={() => setActiveTab("pending")}
                >
                  <View
                    style={[
                      styles.alertIconBox,
                      { backgroundColor: "#FFB34720" },
                    ]}
                  >
                    <Ionicons name="time-outline" size={24} color="#FFB347" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>
                      {pendingGroups.length} group
                      {pendingGroups.length > 1 ? "s" : ""} waiting for approval
                    </Text>
                    <Text style={styles.alertDesc}>
                      Tap to review and approve or reject
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFB347" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === "users" && (
            <View style={styles.section}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={theme.subText}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: theme.text, fontSize: fontSizes.sm },
                  ]}
                  placeholder="Search users..."
                  placeholderTextColor={theme.subText}
                  value={userSearch}
                  onChangeText={setUserSearch}
                />
                {userSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setUserSearch("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={theme.subText}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  Users ({filteredUsers.length})
                </Text>
                {filteredUsers.length === 0 ? (
                  <View style={styles.miniCenter}>
                    <Text style={[styles.centerText, { color: theme.subText }]}>
                      No users found
                    </Text>
                  </View>
                ) : (
                  filteredUsers.map((u, i) => (
                    <View
                      key={u.id}
                      style={[
                        styles.userRow,
                        { borderBottomColor: theme.border },
                        i < filteredUsers.length - 1 && {
                          borderBottomWidth: 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.userAvatar,
                          { backgroundColor: u.profile_color || "#00467F" },
                        ]}
                      >
                        <Text style={styles.userAvatarText}>
                          {(u.name || "U")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.userName,
                            { color: theme.text, fontSize: fontSizes.sm },
                          ]}
                        >
                          {u.name}
                        </Text>
                        <Text
                          style={[
                            styles.userEmail,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {u.email}
                        </Text>
                        <View
                          style={[
                            styles.rolePill,
                            {
                              backgroundColor:
                                u.role === "admin" ? "#00467F20" : "#51CF6620",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.rolePillText,
                              {
                                color:
                                  u.role === "admin" ? "#00467F" : "#51CF66",
                                fontSize: fontSizes.xs,
                              },
                            ]}
                          >
                            {u.role}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.userActions}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => toggleUserRole(u.id, u.role)}
                        >
                          <Ionicons
                            name={
                              u.role === "admin"
                                ? "shield-checkmark"
                                : "shield-outline"
                            }
                            size={18}
                            color="#00467F"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => deleteUser(u.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#FF6B6B"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* ── GROUPS TAB ── */}
          {activeTab === "groups" && (
            <View style={styles.section}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={theme.subText}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: theme.text, fontSize: fontSizes.sm },
                  ]}
                  placeholder="Search groups..."
                  placeholderTextColor={theme.subText}
                  value={groupSearch}
                  onChangeText={setGroupSearch}
                />
                {groupSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setGroupSearch("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={theme.subText}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  All Groups ({filteredGroups.length})
                </Text>
                {filteredGroups.length === 0 ? (
                  <View style={styles.miniCenter}>
                    <Text style={[styles.centerText, { color: theme.subText }]}>
                      No groups found
                    </Text>
                  </View>
                ) : (
                  filteredGroups.map((g, i) => (
                    <View
                      key={g.id}
                      style={[
                        styles.groupRow,
                        { borderBottomColor: theme.border },
                        i < filteredGroups.length - 1 && {
                          borderBottomWidth: 1,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.groupName,
                            { color: theme.text, fontSize: fontSizes.sm },
                          ]}
                        >
                          {g.name}
                        </Text>
                        <Text
                          style={[
                            styles.groupMeta,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {g.category} • {g.member_count || 0} members
                        </Text>
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor:
                                g.status === "active"
                                  ? "#51CF6620"
                                  : "#FFB34720",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  g.status === "active" ? "#51CF66" : "#FFB347",
                                fontSize: fontSizes.xs,
                              },
                            ]}
                          >
                            {g.status}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.groupActions}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() =>
                            navigation.navigate("GroupDetails", {
                              groupId: g.id,
                            })
                          }
                        >
                          <Ionicons
                            name="eye-outline"
                            size={18}
                            color="#00467F"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => deleteGroup(g.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#FF6B6B"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* ── PENDING TAB ── */}
          {activeTab === "pending" && (
            <View style={styles.section}>
              {pendingGroups.length === 0 ? (
                <View style={styles.center}>
                  <Text style={styles.emptyEmoji}>✅</Text>
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    All caught up!
                  </Text>
                  <Text style={[styles.centerText, { color: theme.subText }]}>
                    No groups pending approval
                  </Text>
                </View>
              ) : (
                pendingGroups.map((group) => (
                  <View
                    key={group.id}
                    style={[
                      styles.card,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.pendingHeader}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.pendingName,
                            { color: theme.text, fontSize: fontSizes.md },
                          ]}
                        >
                          {group.name}
                        </Text>
                        <Text
                          style={[
                            styles.pendingMeta,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {group.category} • Created by{" "}
                          {group.creator_name || "Unknown"}
                        </Text>
                      </View>
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.pendingDesc,
                        { color: theme.subText, fontSize: fontSizes.sm },
                      ]}
                    >
                      {group.description}
                    </Text>

                    <View style={styles.pendingBtns}>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => approveGroup(group.id)}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => rejectGroup(group.id)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </WithDrawer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 60,
  },
  centerText: { fontSize: 14, textAlign: "center" },
  miniCenter: { alignItems: "center", paddingVertical: 24 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "bold" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontWeight: "bold", marginBottom: 4 },
  subtitle: {},
  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    width: "47%",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontWeight: "bold" },
  statLabel: { textAlign: "center" },

  tabsScroll: { marginVertical: 14 },
  tabsRow: { gap: 8 },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8ECF4",
  },
  tabChipActive: { backgroundColor: "#00467F", borderColor: "#00467F" },
  tabChipText: { fontWeight: "500" },
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

  tabContent: { paddingBottom: 16 },
  section: { gap: 16 },

  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 12,
    elevation: 1,
  },
  cardTitle: { fontWeight: "bold" },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  summaryLabel: {},
  summaryValue: { fontWeight: "bold" },

  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF8E1",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FFB347",
  },
  alertIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59F00",
    marginBottom: 2,
  },
  alertDesc: { fontSize: 12, color: "#888" },
  alertLink: { color: "#00467F", fontWeight: "bold", fontSize: 14 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: { flex: 1 },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  userName: { fontWeight: "600", marginBottom: 2 },
  userEmail: { marginBottom: 4 },
  rolePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  rolePillText: { fontWeight: "600", textTransform: "capitalize" },
  userActions: { flexDirection: "row", gap: 4 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  groupName: { fontWeight: "600", marginBottom: 2 },
  groupMeta: { marginBottom: 4 },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusText: { fontWeight: "600", textTransform: "capitalize" },
  groupActions: { flexDirection: "row", gap: 4 },

  pendingHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pendingName: { fontWeight: "bold", marginBottom: 4 },
  pendingMeta: {},
  pendingBadge: {
    backgroundColor: "#FFB34720",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingBadgeText: { color: "#FFB347", fontSize: 11, fontWeight: "600" },
  pendingDesc: { lineHeight: 20 },
  pendingBtns: { flexDirection: "row", gap: 10 },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#51CF66",
    borderRadius: 10,
    height: 42,
  },
  approveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    height: 42,
  },
  rejectBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
