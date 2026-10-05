import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  AppState,
  AppStateStatus,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useResponsive } from "../../components/useResponsive";
import WithDrawer from "../../components/withDrawer";
import GroupCoverThumbnail, {
  GroupCoverHeader,
  GroupProfileThumbnail,
} from "../../components/GroupCoverThumbnail";
import { GROUP_UPDATED_EVENT } from "../../components/groupEvents";
import { CATEGORY_VECTOR_ICONS, getCategoryVectorIcon } from "../../constants/categories";

const CAT_ICONS: any = CATEGORY_VECTOR_ICONS;

const CAT_COLORS: any = {
  study: "#4C9BE8",
  sports: "#51CF66",
  tech: "#845EF7",
  arts: "#FF6B6B",
  dance: "#FF6B9D",
  business: "#FFB347",
  health: "#20C997",
  social: "#FD7E14",
};

const ROLE_COLORS: any = {
  admin: "#00467F",
  moderator: "#845EF7",
  member: "#51CF66",
};

export default function MyGroupsScreen({ navigation }: any) {
  const { theme, fontSizes } = useTheme();
  const { isMobile, padding } = useResponsive();
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchMyGroups();

    const sub = DeviceEventEmitter.addListener(GROUP_UPDATED_EVENT, (payload) => {
      if (payload?.groupId) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === payload.groupId ? { ...g, ...payload } : g
          )
        );
      }
    });

    const unsubFocus = navigation.addListener("focus", () => {
      fetchMyGroups(true);
    });

    // Auto-sync when app returns from background or window focuses on web
    const appStateSub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        fetchMyGroups(true);
      }
    });

    // Seamless real-time sync heartbeat between phone & laptop previews
    const syncInterval = setInterval(() => {
      fetchMyGroups(true);
    }, 8000);

    return () => {
      sub.remove();
      unsubFocus();
      appStateSub.remove();
      clearInterval(syncInterval);
    };
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyGroups();
    setRefreshing(false);
  };

  const fetchMyGroups = async (silent?: boolean | any) => {
    const isSilent = silent === true;
    try {
      if (!isSilent) setLoading(true);
      const res = await api.get("/users/my-groups");
      if (res.data.success) {
        const list = res.data.groups || [];
        setGroups(list);
        fetchUnreadCounts(list);
      }
    } catch (err) {
      console.log("My groups error:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const fetchUnreadCounts = async (groupList: any[]) => {
    const counts: Record<number, number> = {};
    await Promise.all(
      groupList.map(async (g) => {
        try {
          const res = await api.get(`/groups/${g.id}/messages/unread-count`);
          if (res.data.success) counts[g.id] = res.data.count;
        } catch {}
      }),
    );
    setUnreadCounts(counts);
  };

  const getIcon = (g: any) => getCategoryVectorIcon(g.category);
  const getColor = (g: any) => g.color || CAT_COLORS[g.category] || "#4C9BE8";

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <WithDrawer
      navigation={navigation}
      activeScreen="My Groups"
      title="My Groups"
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
              My Groups
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.subText, fontSize: fontSizes.sm },
              ]}
            >
              {groups.length > 0
                ? `You are in ${groups.length} group${groups.length > 1 ? "s" : ""}`
                : "You have not joined any groups yet"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate("CreateGroup")}
          >
            <Ionicons name="add" size={20} color="#fff" />
            {!isMobile && <Text style={styles.createBtnText}>New Group</Text>}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            {
              marginHorizontal: padding,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={theme.subText} />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.text, fontSize: fontSizes.sm },
            ]}
            placeholder="Search your groups..."
            placeholderTextColor={theme.subText}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={theme.subText} />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <View style={[styles.list, { paddingHorizontal: padding }]}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#00467F" />
              <Text style={[styles.centerText, { color: theme.subText }]}>
                Loading your groups...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.center}>
              <Ionicons
                name={search ? "search-outline" : "people-outline"}
                size={54}
                color={theme.subText}
                style={{ marginBottom: 12 }}
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {search ? "No groups found" : "No groups yet"}
              </Text>
              <Text style={[styles.centerText, { color: theme.subText }]}>
                {search
                  ? "Try different keywords"
                  : "Join or create a group to start"}
              </Text>
              {!search && (
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => navigation.navigate("Home")}
                >
                  <Text style={styles.browseBtnText}>Browse Groups</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filtered.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() =>
                  navigation.navigate("GroupDetails", { groupId: group.id })
                }
                activeOpacity={0.85}
              >
                {/* 2. Cover Photo Background (Hero Card Style) */}
                <GroupCoverHeader
                  coverImage={group.cover_image}
                  category={group.category}
                  height={96}
                  borderRadius={16}
                >
                  <View style={styles.cardHeaderStrip}>
                    <View style={styles.cardHeaderLeft}>
                      {/* 1. Profile Picture Thumbnail in the small section */}
                      <GroupProfileThumbnail
                        profileImage={group.profile_image}
                        category={group.category}
                        fallbackIcon={getIcon(group)}
                        color={getColor(group)}
                        size={38}
                        borderRadius={10}
                      />
                      <View style={styles.roleBadgeGlass}>
                        <Text style={styles.roleTextGlass}>{group.my_role}</Text>
                      </View>
                    </View>

                    <View style={styles.headerRightRow}>
                      {group.status === "pending" && (
                        <View style={styles.pendingBadgeGlass}>
                          <Ionicons
                            name="time-outline"
                            size={11}
                            color="#FFB347"
                          />
                          <Text style={styles.pendingBadgeGlassText}>Pending</Text>
                        </View>
                      )}
                      {unreadCounts[group.id] > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {unreadCounts[group.id] > 99
                              ? "99+"
                              : unreadCounts[group.id]}
                          </Text>
                        </View>
                      )}
                      <View style={styles.chevronGlass}>
                        <Ionicons
                          name="chevron-forward"
                          size={15}
                          color="#FFFFFF"
                        />
                      </View>
                    </View>
                  </View>
                </GroupCoverHeader>

                <View style={styles.cardInfo}>
                  <View style={styles.cardTopRow}>
                    <Text
                      style={[
                        styles.cardName,
                        { color: theme.text, fontSize: fontSizes.md + 1 },
                      ]}
                      numberOfLines={1}
                    >
                      {group.name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.cardDesc,
                      { color: theme.subText, fontSize: fontSizes.xs + 1 },
                    ]}
                    numberOfLines={2}
                  >
                    {group.description || "No description provided."}
                  </Text>
                  {group.meeting_time ? (
                    <View style={styles.metaRow}>
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={theme.subText}
                      />
                      <Text
                        style={[
                          styles.metaText,
                          { color: theme.subText, fontSize: fontSizes.xs },
                        ]}
                      >
                        {group.meeting_time}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Discover Box */}
        {!loading && groups.length > 0 && (
          <TouchableOpacity
            style={[styles.discoverBox, { marginHorizontal: padding }]}
            onPress={() => navigation.navigate("Home")}
          >
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="search" size={15} color="#fff" />
                <Text style={styles.discoverTitle}>
                  Looking for more groups?
                </Text>
              </View>
              <Text style={styles.discoverDesc}>
                Browse hundreds of campus groups
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

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
  createBtn: {
    backgroundColor: "#00467F",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  createBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: { flex: 1 },
  list: { gap: 12 },
  center: { alignItems: "center", paddingVertical: 60, gap: 12 },
  centerText: { fontSize: 14, textAlign: "center" },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "bold" },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#00467F",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  browseBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  card: {
    borderRadius: 16,
    flexDirection: "column",
    borderWidth: 1,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 12,
  },
  cardHeaderStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadgeGlass: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  roleTextGlass: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pendingBadgeGlass: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#FFB347",
  },
  pendingBadgeGlassText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFB347",
  },
  chevronGlass: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0, 0, 0, 0.50)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: { fontSize: 28 },
  cardInfo: { flex: 1, padding: 12, gap: 4 },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardName: { fontWeight: "bold", flex: 1, marginRight: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  roleText: { fontWeight: "600", textTransform: "capitalize" },
  cardDesc: {},
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF8E1",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#FFB347",
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFB347",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: {},
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  chevron: { paddingHorizontal: 0 },
  discoverBox: {
    backgroundColor: "#00467F",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  discoverTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  discoverDesc: { fontSize: 13, color: "rgba(255,255,255,0.75)" },
});
