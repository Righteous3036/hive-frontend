import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    RefreshControl,
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
  const { padding, width } = useResponsive();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [pendingGroups, setPendingGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");

  const spinAnim = useRef(new Animated.Value(0)).current;
  const wheelRotateAnim = useRef(new Animated.Value(0)).current;

  // Responsive circular control ring dimensions
  const ringSize = Math.min(width - padding * 2, 304);
  const centerSize = Math.round(ringSize * 0.24); // ~73px
  const quadGap = 8;
  const quadSize = (ringSize - quadGap) / 2; // ~148px
  const neonRadius = Math.round(centerSize * 0.58); // ~42px

  useEffect(() => {
    fetchData();
    // Refresh every 15 seconds to get real-time updates
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Endless smooth 360-degree continuous rotation for the colored wheel
  useEffect(() => {
    const wheelLoop = Animated.loop(
      Animated.timing(wheelRotateAnim, {
        toValue: 1,
        duration: 24000, // 24 seconds for smooth, serene, non-jarring continuous rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    wheelLoop.start();
    return () => wheelLoop.stop();
  }, []);

  const wheelRotateInterpolate = wheelRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Counter-rotation to keep icons and metric text upright and legible
  const counterRotateInterpolate = wheelRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  useEffect(() => {
    if (loading || refreshing) {
      const loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    } else {
      spinAnim.setValue(0);
    }
  }, [loading, refreshing]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["45deg", "405deg"],
  });

  const fetchData = async () => {
    try {
      setRefreshing(true);
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
      setRefreshing(false);
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

  if (loading) {
    return (
      <WithDrawer
        navigation={navigation}
        activeScreen="AdminDashboard"
        title="Admin"
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22D3EE" />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
            tintColor="#22D3EE"
            colors={["#22D3EE"]}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: padding }]}>
          <Text
            style={[
              styles.title,
              { color: theme.text, fontSize: fontSizes.xxl },
            ]}
          >
            Admin Dashboard
          </Text>
        </View>

        {/* Circular Segmented Control Ring Display */}
        <View style={styles.ringOuterWrapper}>
          <View
            style={[
              styles.ringBase,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
              },
            ]}
          >
            {/* Continuously Rotating Colored Multi-Segment Wheel */}
            <Animated.View
              style={[
                styles.rotatingWheel,
                {
                  width: ringSize,
                  height: ringSize,
                  transform: [{ rotate: wheelRotateInterpolate }],
                },
              ]}
            >
              {/* Top Row: Red (Top-Left) & Blue (Top-Right) */}
              <View style={[styles.ringRow, { height: quadSize }]}>
                {/* Top-Left: RED - Total Users */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveTab("users")}
                  style={[
                    styles.quadrant,
                    styles.quadrantTopLeft,
                    {
                      width: quadSize,
                      height: quadSize,
                      borderTopLeftRadius: ringSize / 2,
                      backgroundColor: "#EF4444",
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.quadContentContainer,
                      { transform: [{ rotate: counterRotateInterpolate }] },
                    ]}
                  >
                    <Ionicons
                      name="people"
                      size={22}
                      color="#FFFFFF"
                      style={styles.quadIcon}
                    />
                    <Text style={styles.quadValueText}>
                      {stats?.total_users ?? 3}
                    </Text>
                    <Text style={styles.quadLabelText}>Total Users</Text>
                  </Animated.View>
                </TouchableOpacity>

                {/* Top-Right: BLUE - Total Groups */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveTab("groups")}
                  style={[
                    styles.quadrant,
                    styles.quadrantTopRight,
                    {
                      width: quadSize,
                      height: quadSize,
                      borderTopRightRadius: ringSize / 2,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.quadContentContainer,
                      { transform: [{ rotate: counterRotateInterpolate }] },
                    ]}
                  >
                    <Ionicons
                      name="apps"
                      size={22}
                      color="#FFFFFF"
                      style={styles.quadIcon}
                    />
                    <Text style={styles.quadValueText}>
                      {stats?.total_groups ?? 24}
                    </Text>
                    <Text style={styles.quadLabelText}>Total Groups</Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>

              {/* Bottom Row: Grey (Bottom-Left) & Green (Bottom-Right) */}
              <View style={[styles.ringRow, { height: quadSize, marginTop: quadGap }]}>
                {/* Bottom-Left: GREY - Pending */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveTab("pending")}
                  style={[
                    styles.quadrant,
                    styles.quadrantBottomLeft,
                    {
                      width: quadSize,
                      height: quadSize,
                      borderBottomLeftRadius: ringSize / 2,
                      backgroundColor: "#525E75",
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.quadContentContainer,
                      { transform: [{ rotate: counterRotateInterpolate }] },
                    ]}
                  >
                    <Ionicons
                      name="time"
                      size={22}
                      color="#FFFFFF"
                      style={styles.quadIcon}
                    />
                    <Text style={styles.quadValueText}>
                      {stats?.pending_groups ?? 0}
                    </Text>
                    <Text style={styles.quadLabelText}>Pending</Text>
                  </Animated.View>
                </TouchableOpacity>

                {/* Bottom-Right: GREEN - Active Groups */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveTab("groups")}
                  style={[
                    styles.quadrant,
                    styles.quadrantBottomRight,
                    {
                      width: quadSize,
                      height: quadSize,
                      borderBottomRightRadius: ringSize / 2,
                      backgroundColor: "#22C55E",
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.quadContentContainer,
                      { transform: [{ rotate: counterRotateInterpolate }] },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#FFFFFF"
                      style={styles.quadIcon}
                    />
                    <Text style={styles.quadValueText}>
                      {stats?.active_groups ?? 23}
                    </Text>
                    <Text style={styles.quadLabelText}>Active Groups</Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Stationary Center Glowing Neon-Blue-Cyan Indicator Disc */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={fetchData}
              accessibilityRole="button"
              accessibilityLabel="Refresh dashboard metrics"
              style={[
                styles.centerDisc,
                {
                  width: centerSize,
                  height: centerSize,
                  borderRadius: centerSize / 2,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.neonArcIndicator,
                  {
                    width: neonRadius,
                    height: neonRadius,
                    borderRadius: neonRadius / 2,
                    transform: [{ rotate: spinInterpolate }],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
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
                              initialGroup: g,
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
                  <Ionicons name="checkmark-circle-outline" size={54} color="#10B981" style={{ marginBottom: 12 }} />
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
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  welcomeNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  welcomeNavBtnText: {
    fontWeight: "700",
  },
  ringOuterWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  ringBase: {
    backgroundColor: "#0B0F19",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "rgba(56, 189, 248, 0.42)",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
    position: "relative",
    overflow: "hidden",
  },
  rotatingWheel: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  quadrant: {
    alignItems: "center",
    justifyContent: "center",
  },
  quadrantTopLeft: {
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 6,
    paddingBottom: 6,
  },
  quadrantTopRight: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingTop: 16,
    paddingRight: 16,
    paddingLeft: 6,
    paddingBottom: 6,
  },
  quadrantBottomLeft: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 6,
    paddingTop: 6,
  },
  quadrantBottomRight: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    paddingBottom: 16,
    paddingRight: 16,
    paddingLeft: 6,
    paddingTop: 6,
  },
  quadContentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  quadIcon: {
    marginBottom: 2,
    opacity: 0.95,
  },
  quadValueText: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 33,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quadLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    opacity: 0.95,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  centerDisc: {
    position: "absolute",
    backgroundColor: "#070B16",
    borderWidth: 3,
    borderColor: "#0B0F19",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
    elevation: 10,
  },
  neonArcIndicator: {
    borderWidth: 3,
    borderColor: "#22D3EE",
    borderTopColor: "transparent",
    shadowColor: "#22D3EE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },

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
