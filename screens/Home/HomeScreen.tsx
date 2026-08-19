import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import api from "../../components/api";
import DrawerContent from "../../components/DrawerContent";
import MobileHeader from "../../components/MobileHeader";
import { useNotifications } from "../../components/NotificationContext";
import Sidebar from "../../components/Sidebar";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";
import { useResponsive } from "../../components/useResponsive";

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.82, 320);

const CATEGORIES = [
  { id: "all", label: "All", icon: "apps-outline" },
  { id: "study", label: "Study", icon: "book-outline" },
  { id: "sports", label: "Sports", icon: "football-outline" },
  { id: "tech", label: "Tech", icon: "code-slash-outline" },
  { id: "arts", label: "Arts", icon: "color-palette-outline" },
  { id: "dance", label: "Dance", icon: "musical-notes-outline" },
  { id: "business", label: "Business", icon: "briefcase-outline" },
  { id: "health", label: "Health", icon: "fitness-outline" },
];

const CAT_ICONS: any = {
  study: "📚",
  sports: "⚽",
  tech: "💻",
  arts: "🎨",
  dance: "💃",
  business: "🚀",
  health: "🏥",
  social: "🌍",
};

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

export default function HomeScreen({ navigation }: any) {
  const { isMobile } = useResponsive();
  const { theme, fontSizes } = useTheme();
  const { unreadCount } = useNotifications();
  const { user, getInitials } = useUser();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<number[]>([]);
  const [pendingGroups, setPendingGroups] = useState<number[]>([]);
  const [savedGroups, setSavedGroups] = useState<number[]>([]);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerX, {
        toValue: -DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerOpen(false));
  };

  useEffect(() => {
    fetchGroups();
    fetchSavedGroups();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/groups");
      if (res.data.success) {
        setGroups(res.data.groups);
        checkMemberships(res.data.groups);
      }
    } catch {
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedGroups = async () => {
    try {
      const res = await api.get("/users/saved");
      if (res.data.success) {
        setSavedGroups(res.data.groups.map((g: any) => g.id));
      }
    } catch (err) {}
  };

  const checkMemberships = async (list: any[]) => {
    const joined: number[] = [];
    const pending: number[] = [];
    await Promise.all(
      list.map(async (g) => {
        try {
          const res = await api.get(`/groups/${g.id}/membership`);
          if (res.data.success) {
            if (res.data.isMember) joined.push(g.id);
            if (res.data.isPending) pending.push(g.id);
          }
        } catch {}
      }),
    );
    setJoinedGroups(joined);
    setPendingGroups(pending);
  };

  const toggleJoin = async (groupId: number) => {
    const wasJoined = joinedGroups.includes(groupId);
    const wasPending = pendingGroups.includes(groupId);
    const group = groups.find((g) => g.id === groupId);

    // Optimistic update
    if (wasJoined) {
      setJoinedGroups((p) => p.filter((id) => id !== groupId));
    } else if (wasPending) {
      setPendingGroups((p) => p.filter((id) => id !== groupId));
    } else {
      if (group?.require_approval) setPendingGroups((p) => [...p, groupId]);
      else setJoinedGroups((p) => [...p, groupId]);
    }
    setGroups((p) =>
      p.map((g) =>
        g.id === groupId
          ? {
              ...g,
              member_count: wasJoined
                ? Math.max(0, (g.member_count || 0) - 1)
                : (g.member_count || 0) + 1,
            }
          : g,
      ),
    );

    setJoiningId(groupId);
    try {
      const res = await api.post(`/groups/${groupId}/toggle-join`);
      if (res.data.success) {
        if (res.data.joined) {
          setJoinedGroups((p) => (p.includes(groupId) ? p : [...p, groupId]));
          setPendingGroups((p) => p.filter((id) => id !== groupId));
        } else if (res.data.status === "pending") {
          setPendingGroups((p) => (p.includes(groupId) ? p : [...p, groupId]));
          setJoinedGroups((p) => p.filter((id) => id !== groupId));
        } else {
          setJoinedGroups((p) => p.filter((id) => id !== groupId));
          setPendingGroups((p) => p.filter((id) => id !== groupId));
        }
      }
    } catch {
      if (wasJoined) setJoinedGroups((p) => [...p, groupId]);
      else {
        setJoinedGroups((p) => p.filter((id) => id !== groupId));
        setPendingGroups((p) => p.filter((id) => id !== groupId));
      }
    } finally {
      setJoiningId(null);
    }
  };

  const toggleSave = async (groupId: number) => {
    const wasSaved = savedGroups.includes(groupId);
    // Optimistic update
    if (wasSaved) {
      setSavedGroups((prev) => prev.filter((id) => id !== groupId));
    } else {
      setSavedGroups((prev) => [...prev, groupId]);
    }
    setSavingId(groupId);
    try {
      await api.post(`/users/saved/${groupId}`);
    } catch (err) {
      // Revert on error
      if (wasSaved) setSavedGroups((prev) => [...prev, groupId]);
      else setSavedGroups((prev) => prev.filter((id) => id !== groupId));
    } finally {
      setSavingId(null);
    }
  };

  const getJoinLabel = (id: number) => {
    if (joiningId === id) return "...";
    if (joinedGroups.includes(id)) return "✓ Joined";
    if (pendingGroups.includes(id)) return "⏳ Pending";
    return "Join";
  };

  const filtered = groups.filter((g) => {
    const catOk = activeCategory === "all" || g.category === activeCategory;
    const searchOk =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const getIcon = (g: any) => CAT_ICONS[g.category] || "📌";
  const getColor = (g: any) => g.color || CAT_COLORS[g.category] || "#4C9BE8";

  // ── SHARED CONTENT ──
  const content = (
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
      {/* Greeting — mobile only */}
      {isMobile && (
        <View style={styles.mobileGreeting}>
          <Text
            style={[
              styles.greetingSub,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            Good morning 👋
          </Text>
          <Text
            style={[
              styles.greetingName,
              { color: theme.text, fontSize: fontSizes.xl },
            ]}
          >
            Welcome, {user?.name?.split(" ")[0] || "Student"}!
          </Text>
        </View>
      )}

      {/* Web header row */}
      {!isMobile && (
        <View style={styles.webHeader}>
          <View>
            <Text
              style={[
                styles.greetingSub,
                { color: theme.subText, fontSize: fontSizes.sm },
              ]}
            >
              Good morning 👋
            </Text>
            <Text
              style={[
                styles.greetingName,
                { color: theme.text, fontSize: fontSizes.xl },
              ]}
            >
              Welcome, {user?.name?.split(" ")[0] || "Student"}!
            </Text>
          </View>
          <View style={styles.webHeaderRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.subText}
              />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              {user?.profile_picture ? (
                <Image
                  source={{ uri: user.profile_picture }}
                  style={styles.webAvatar}
                />
              ) : (
                <View
                  style={[
                    styles.webAvatarFallback,
                    { backgroundColor: user?.profile_color || "#00467F" },
                  ]}
                >
                  <Text style={styles.webAvatarText}>{getInitials()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme.card, borderColor: theme.border },
          isMobile ? styles.searchMobile : styles.searchWeb,
        ]}
      >
        <Ionicons name="search-outline" size={18} color={theme.subText} />
        <TextInput
          style={[
            styles.searchInput,
            { color: theme.text, fontSize: fontSizes.sm },
          ]}
          placeholder="Search groups..."
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

      {/* Loading */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00467F" />
          <Text style={[styles.centerText, { color: theme.subText }]}>
            Loading groups...
          </Text>
        </View>
      )}

      {/* Error */}
      {!loading && error.length > 0 && (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={[styles.centerText, { color: theme.subText }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchGroups}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Categories */}
      {!loading && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.catsContent,
            isMobile ? { paddingHorizontal: 16 } : { paddingHorizontal: 28 },
          ]}
          style={styles.catsScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catChip,
                { borderColor: theme.border },
                activeCategory === cat.id && styles.catChipActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={13}
                color={activeCategory === cat.id ? "#fff" : theme.subText}
              />
              <Text
                style={[
                  styles.catLabel,
                  {
                    color: activeCategory === cat.id ? "#fff" : theme.subText,
                    fontSize: fontSizes.xs,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Groups */}
      {!loading && !error && (
        <View style={isMobile ? styles.groupsMobile : styles.groupsWeb}>
          <View
            style={[
              styles.sectionHeader,
              isMobile ? { paddingHorizontal: 16 } : { paddingHorizontal: 28 },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontSize: fontSizes.lg },
              ]}
            >
              {activeCategory === "all"
                ? "🔥 All Groups"
                : `${activeCategory} Groups`}
            </Text>
            <Text
              style={[
                styles.groupCount,
                { color: theme.subText, fontSize: fontSizes.xs },
              ]}
            >
              {filtered.length} groups
            </Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No groups found
              </Text>
              <Text style={[styles.centerText, { color: theme.subText }]}>
                Try a different search or category
              </Text>
            </View>
          ) : isMobile ? (
            // ── MOBILE CARDS ──
            <View style={styles.mobileList}>
              {filtered.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.mobileCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() =>
                    navigation.navigate("GroupDetails", { groupId: group.id })
                  }
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.mobileCardAccent,
                      { backgroundColor: getColor(group) },
                    ]}
                  />

                  <View
                    style={[
                      styles.mobileCardIconBox,
                      { backgroundColor: getColor(group) + "20" },
                    ]}
                  >
                    <Text style={styles.mobileCardEmoji}>{getIcon(group)}</Text>
                  </View>

                  <View style={styles.mobileCardBody}>
                    <Text
                      style={[
                        styles.mobileCardName,
                        { color: theme.text, fontSize: fontSizes.md },
                      ]}
                      numberOfLines={1}
                    >
                      {group.name}
                    </Text>
                    <Text
                      style={[
                        styles.mobileCardDesc,
                        { color: theme.subText, fontSize: fontSizes.xs },
                      ]}
                      numberOfLines={1}
                    >
                      {group.description}
                    </Text>
                    <View style={styles.mobileCardFooter}>
                      <View style={styles.membersRow}>
                        <Ionicons
                          name="people-outline"
                          size={12}
                          color={theme.subText}
                        />
                        <Text
                          style={[
                            styles.membersText,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {group.member_count || 0}
                        </Text>
                      </View>
                      <View style={styles.membersRow}>
                        <TouchableOpacity
                          onPress={() => toggleSave(group.id)}
                          disabled={savingId === group.id}
                          style={{ padding: 4 }}
                        >
                          <Ionicons
                            name={
                              savedGroups.includes(group.id)
                                ? "bookmark"
                                : "bookmark-outline"
                            }
                            size={16}
                            color={
                              savedGroups.includes(group.id)
                                ? "#00467F"
                                : theme.subText
                            }
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.joinBtn,
                            { borderColor: getColor(group) },
                            joinedGroups.includes(group.id) &&
                              styles.joinBtnJoined,
                            pendingGroups.includes(group.id) &&
                              styles.joinBtnPending,
                          ]}
                          onPress={() => toggleJoin(group.id)}
                          disabled={joiningId === group.id}
                        >
                          <Text
                            style={[
                              styles.joinBtnText,
                              { fontSize: fontSizes.xs },
                              joinedGroups.includes(group.id)
                                ? styles.joinTextJoined
                                : pendingGroups.includes(group.id)
                                  ? styles.joinTextPending
                                  : { color: getColor(group) },
                            ]}
                          >
                            {getJoinLabel(group.id)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // ── WEB GRID ──
            <View style={styles.webGrid}>
              {filtered.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.webCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() =>
                    navigation.navigate("GroupDetails", { groupId: group.id })
                  }
                >
                  <View
                    style={[
                      styles.webCardHeader,
                      { backgroundColor: getColor(group) + "15" },
                    ]}
                  >
                    <View
                      style={[
                        styles.webCardIconBox,
                        { backgroundColor: getColor(group) + "25" },
                      ]}
                    >
                      <Text style={styles.webCardEmoji}>{getIcon(group)}</Text>
                    </View>
                    <View style={styles.webCardTitleBox}>
                      <Text
                        style={[
                          styles.webCardName,
                          { color: theme.text, fontSize: fontSizes.sm },
                        ]}
                        numberOfLines={1}
                      >
                        {group.name}
                      </Text>
                      <View style={styles.webCardCatRow}>
                        <View
                          style={[
                            styles.webCardDot,
                            { backgroundColor: getColor(group) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.webCardCat,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {group.category}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.webCardBody}>
                    <Text
                      style={[
                        styles.webCardDesc,
                        { color: theme.subText, fontSize: fontSizes.xs },
                      ]}
                      numberOfLines={2}
                    >
                      {group.description}
                    </Text>
                    <View style={styles.tagsRow}>
                      {(group.tags || [])
                        .slice(0, 3)
                        .map((tag: string, i: number) => (
                          <View
                            key={i}
                            style={[
                              styles.tag,
                              { backgroundColor: theme.inputBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.tagText,
                                {
                                  color: theme.subText,
                                  fontSize: fontSizes.xs,
                                },
                              ]}
                            >
                              {tag}
                            </Text>
                          </View>
                        ))}
                    </View>
                    <View style={styles.webCardFooter}>
                      <View style={styles.membersRow}>
                        <Ionicons
                          name="people-outline"
                          size={13}
                          color={theme.subText}
                        />
                        <Text
                          style={[
                            styles.membersText,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {group.member_count || 0} members
                        </Text>
                      </View>
                      <View style={styles.membersRow}>
                        <TouchableOpacity
                          onPress={() => toggleSave(group.id)}
                          disabled={savingId === group.id}
                          style={{ padding: 4 }}
                        >
                          <Ionicons
                            name={
                              savedGroups.includes(group.id)
                                ? "bookmark"
                                : "bookmark-outline"
                            }
                            size={16}
                            color={
                              savedGroups.includes(group.id)
                                ? "#00467F"
                                : theme.subText
                            }
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.joinBtn,
                            { borderColor: getColor(group) },
                            joinedGroups.includes(group.id) &&
                              styles.joinBtnJoined,
                            pendingGroups.includes(group.id) &&
                              styles.joinBtnPending,
                          ]}
                          onPress={() => toggleJoin(group.id)}
                          disabled={joiningId === group.id}
                        >
                          <Text
                            style={[
                              styles.joinBtnText,
                              { fontSize: fontSizes.xs },
                              joinedGroups.includes(group.id)
                                ? styles.joinTextJoined
                                : pendingGroups.includes(group.id)
                                  ? styles.joinTextPending
                                  : { color: getColor(group) },
                            ]}
                          >
                            {getJoinLabel(group.id)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── MOBILE LAYOUT ──
  if (isMobile) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <View style={[styles.mobileRoot, { backgroundColor: theme.bg }]}>
          <MobileHeader
            title="Hive 🐝"
            onMenuPress={openDrawer}
            navigation={navigation}
          />

          {content}

          {/* Overlay */}
          {drawerOpen && (
            <TouchableWithoutFeedback onPress={closeDrawer}>
              <Animated.View
                style={[styles.overlay, { opacity: overlayOpacity }]}
              />
            </TouchableWithoutFeedback>
          )}

          {/* Drawer */}
          <Animated.View
            style={[
              styles.drawer,
              {
                width: DRAWER_WIDTH,
                backgroundColor: theme.sidebarBg,
                transform: [{ translateX: drawerX }],
              },
            ]}
          >
            <DrawerContent
              navigation={navigation}
              activeScreen="Home"
              onClose={closeDrawer}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // ── WEB LAYOUT ──
  return (
    <View style={[styles.webRoot, { backgroundColor: theme.bg }]}>
      <Sidebar navigation={navigation} activeScreen="Home" />
      <View style={{ flex: 1 }}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  mobileRoot: { flex: 1 },
  webRoot: { flexDirection: "row", flex: 1 },
  scroll: { flex: 1 },

  // Greeting
  mobileGreeting: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  webHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 16,
  },
  webHeaderRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  greetingSub: { marginBottom: 2 },
  greetingName: { fontWeight: "bold" },
  notifBtn: { position: "relative", padding: 8 },
  notifBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  webAvatar: { width: 40, height: 40, borderRadius: 20 },
  webAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  webAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
    marginTop: 8,
    gap: 10,
  },
  searchMobile: { marginHorizontal: 16 },
  searchWeb: { marginHorizontal: 28 },
  searchInput: { flex: 1 },

  // States
  center: { alignItems: "center", paddingVertical: 60, gap: 12 },
  centerText: { fontSize: 14, textAlign: "center" },
  errorEmoji: { fontSize: 36 },
  retryBtn: {
    backgroundColor: "#00467F",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyEmoji: { fontSize: 44, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "bold" },

  // Categories
  catsScroll: { marginBottom: 16 },
  catsContent: { gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1.5,
  },
  catChipActive: { backgroundColor: "#00467F", borderColor: "#00467F" },
  catLabel: { fontWeight: "500" },

  // Section header
  groupsMobile: {},
  groupsWeb: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: { fontWeight: "bold" },
  groupCount: {},

  // Mobile cards
  mobileList: { paddingHorizontal: 16, gap: 12 },
  mobileCard: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
  },
  mobileCardAccent: { width: 4, alignSelf: "stretch" },
  mobileCardIconBox: {
    width: 70,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileCardEmoji: { fontSize: 28 },
  mobileCardBody: { flex: 1, padding: 12, gap: 4 },
  mobileCardName: { fontWeight: "bold" },
  mobileCardDesc: {},
  mobileCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  // Web grid
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 28,
  },
  webCard: {
    width: "31%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    elevation: 2,
  },
  webCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  webCardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  webCardEmoji: { fontSize: 22 },
  webCardTitleBox: { flex: 1 },
  webCardName: { fontWeight: "bold", marginBottom: 2 },
  webCardCatRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  webCardDot: { width: 6, height: 6, borderRadius: 3 },
  webCardCat: { textTransform: "capitalize" },
  webCardBody: { padding: 14, paddingTop: 0 },
  webCardDesc: { lineHeight: 18, marginBottom: 10 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontWeight: "500" },
  webCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Shared
  membersRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  membersText: {},
  joinBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  joinBtnJoined: { backgroundColor: "#E8F5E9", borderColor: "#51CF66" },
  joinBtnPending: { backgroundColor: "#FFF8E1", borderColor: "#FFB347" },
  joinBtnText: { fontWeight: "600" },
  joinTextJoined: { color: "#2E7D32" },
  joinTextPending: { color: "#F59F00" },

  // Drawer
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 99,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    elevation: 20,
  },
});
