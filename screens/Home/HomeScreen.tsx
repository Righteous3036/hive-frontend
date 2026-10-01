import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
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
import { LinearGradient } from "expo-linear-gradient";
import api from "../../components/api";
import DrawerContent from "../../components/DrawerContent";
import MobileHeader from "../../components/MobileHeader";
import BottomTabBar from "../../components/BottomTabBar";
import { useNotifications } from "../../components/NotificationContext";
import Sidebar from "../../components/Sidebar";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";
import { useResponsive } from "../../components/useResponsive";
import { Radii, Shadows, Spacing } from "../../constants/theme";
import CategoryChip from "../../components/ui/CategoryChip";
import EmptyState from "../../components/ui/EmptyState";
import FadeInView from "../../components/ui/FadeInView";
import SkeletonCard from "../../components/ui/SkeletonCard";
import FloatingBee from "../../components/ui/FloatingBee";
import MemberAvatarRow, { MemberItem } from "../../components/ui/MemberAvatarRow";
import ScreenTransition from "../../components/ui/ScreenTransition";

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.82, 320);

const CATEGORIES = [
  { id: "all", label: "All", icon: "apps-outline", emoji: "⚡" },
  { id: "study", label: "Study", icon: "book-outline", emoji: "📚" },
  { id: "sports", label: "Sports", icon: "football-outline", emoji: "⚽" },
  { id: "tech", label: "Tech", icon: "code-slash-outline", emoji: "💻" },
  { id: "arts", label: "Arts", icon: "color-palette-outline", emoji: "🎨" },
];

const CAT_ICONS: Record<string, string> = {
  study: "📚",
  sports: "⚽",
  tech: "💻",
  arts: "🎨",
  dance: "💃",
  business: "🚀",
  health: "🏥",
  social: "🌍",
};

const CAT_COLORS: Record<string, string> = {
  study: "#4C9BE8",
  sports: "#34C759",
  tech: "#7C5CFC",
  arts: "#EF4444",
  dance: "#EC4899",
  business: "#F5A623",
  health: "#10B981",
  social: "#F97316",
};

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: Quick Stat Item with Spring Interaction
// ─────────────────────────────────────────────────────────────
interface QuickStatItemProps {
  label: string;
  value: number;
  color: string;
  isActive?: boolean;
  onPress: () => void;
  fontSizes: any;
  theme: any;
}

function QuickStatItem({
  label,
  value,
  color,
  isActive = false,
  onPress,
  fontSizes,
  theme,
}: QuickStatItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      tension: 140,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.statItemWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.statItem,
          isActive && {
            backgroundColor: color + "18",
            borderRadius: Radii.md,
            paddingVertical: 4,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        <Text style={[styles.statValue, { color, fontSize: fontSizes.lg }]}>
          {value}
        </Text>
        <Text
          style={[
            styles.statLabel,
            {
              color: isActive ? color : theme.textSecondary,
              fontSize: fontSizes.xs,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: Interactive Group Card with High-End Feedback
// ─────────────────────────────────────────────────────────────
interface GroupCardProps {
  group: any;
  idx: number;
  isMobile: boolean;
  groupColor: string;
  icon: string;
  isJoined: boolean;
  isPending: boolean;
  isSaved: boolean;
  savingId: number | null;
  joiningId: number | null;
  onPress: () => void;
  onToggleSave: () => void;
  onToggleJoin: () => void;
  joinLabel: string;
  theme: any;
  fontSizes: any;
}

function InteractiveGroupCard({
  group,
  idx,
  isMobile,
  groupColor,
  icon,
  isJoined,
  isPending,
  isSaved,
  savingId,
  joiningId,
  onPress,
  onToggleSave,
  onToggleJoin,
  joinLabel,
  theme,
  fontSizes,
}: GroupCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;
  const joinBtnScale = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  const handleCardPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      tension: 130,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isHovered ? 1.015 : 1.0,
      tension: 90,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverIn = () => {
    if (Platform.OS === "web") {
      setIsHovered(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.015,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: -4,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === "web") {
      setIsHovered(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleSavePress = () => {
    Animated.sequence([
      Animated.spring(bookmarkScale, {
        toValue: 1.4,
        tension: 160,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(bookmarkScale, {
        toValue: 1.0,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
    onToggleSave();
  };

  const handleJoinPressIn = () => {
    Animated.spring(joinBtnScale, {
      toValue: 0.92,
      tension: 150,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleJoinPressOut = () => {
    Animated.spring(joinBtnScale, {
      toValue: 1.0,
      tension: 110,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <FadeInView
      delay={Math.min(idx * 40, 260)}
      direction="up"
      style={isMobile ? undefined : styles.webCardWrapper}
    >
      <Animated.View
        style={[
          {
            transform: [
              { translateY: liftAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Pressable
          style={[
            isMobile ? styles.mobileCard : styles.webCard,
            {
              backgroundColor: theme.card,
              borderColor: isHovered ? groupColor : theme.border,
            },
            isHovered ? Shadows.md : Shadows.sm,
          ]}
          onPress={onPress}
          onPressIn={handleCardPressIn}
          onPressOut={handleCardPressOut}
          // @ts-ignore Web hover
          onHoverIn={handleHoverIn}
          // @ts-ignore Web hover
          onHoverOut={handleHoverOut}
          accessibilityRole="button"
          accessibilityLabel={`${group.name} in ${group.category || "General"}`}
        >
          {/* Header Strip with Category Pill & Save Action */}
          <View
            style={[
              styles.cardHeaderStrip,
              { backgroundColor: groupColor + "14" },
            ]}
          >
            <View style={styles.cardHeaderLeft}>
              <View
                style={[
                  styles.cardIconBox,
                  { backgroundColor: groupColor + "24" },
                ]}
              >
                <Text style={styles.cardEmoji}>{icon}</Text>
              </View>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: groupColor + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    { color: groupColor, fontSize: fontSizes.xs - 1 },
                  ]}
                >
                  {group.category?.toUpperCase() || "GENERAL"}
                </Text>
              </View>
            </View>

            {/* Interactive Save / Bookmark with Spring Pop */}
            <Pressable
              onPress={handleSavePress}
              disabled={savingId === group.id}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? "Unsave group" : "Save group"}
              style={styles.saveBtn}
              hitSlop={8}
            >
              <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={isSaved ? theme.primary : theme.textSecondary}
                />
              </Animated.View>
            </Pressable>
          </View>

          {/* Card Content Body */}
          <View style={styles.cardBody}>
            <Text
              style={[
                styles.cardName,
                { color: theme.text, fontSize: fontSizes.md + 1 },
              ]}
              numberOfLines={1}
            >
              {group.name}
            </Text>

            <Text
              style={[
                styles.cardDesc,
                { color: theme.textSecondary, fontSize: fontSizes.sm },
              ]}
              numberOfLines={2}
            >
              {group.description || "No description provided."}
            </Text>

            {/* Tags */}
            {group.tags && group.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {group.tags.slice(0, 3).map((tag: string, tagIdx: number) => (
                  <View
                    key={tagIdx}
                    style={[
                      styles.tagPill,
                      { backgroundColor: theme.inputBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagPillText,
                        { color: theme.textSecondary, fontSize: fontSizes.xs - 1 },
                      ]}
                    >
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Card Footer with Members & Join Button */}
            <View
              style={[
                styles.cardFooter,
                { borderTopColor: theme.borderLight },
              ]}
            >
              <View style={styles.membersMeta}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={theme.primary}
                />
                <Text
                  style={[
                    styles.membersCountText,
                    { color: theme.textSecondary, fontSize: fontSizes.xs },
                  ]}
                >
                  {group.member_count || 0} members
                </Text>
              </View>

              <Animated.View style={{ transform: [{ scale: joinBtnScale }] }}>
                <Pressable
                  style={[
                    styles.joinActionButton,
                    isJoined
                      ? [styles.joinedButton, { backgroundColor: theme.successLight }]
                      : isPending
                      ? [styles.pendingButton, { backgroundColor: theme.warningLight }]
                      : [styles.primaryJoinButton, { backgroundColor: groupColor }],
                  ]}
                  onPress={onToggleJoin}
                  onPressIn={handleJoinPressIn}
                  onPressOut={handleJoinPressOut}
                  disabled={joiningId === group.id}
                  accessibilityRole="button"
                  accessibilityLabel={joinLabel}
                >
                  {joiningId === group.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.joinButtonText,
                        {
                          color: isJoined
                            ? theme.success
                            : isPending
                            ? theme.warning
                            : "#FFFFFF",
                          fontSize: fontSizes.xs,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {joinLabel}
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </FadeInView>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: Warm Amber Floating Action Button (FAB)
// ─────────────────────────────────────────────────────────────
interface FABProps {
  onPress: () => void;
  theme: any;
}

function FloatingActionButton({ onPress, theme }: FABProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      tension: 160,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      tension: 110,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.fabButton,
          { backgroundColor: theme.amber || '#F59E0B' },
          (Shadows as any).amberGlow || Shadows.lg,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Create New Group"
      >
        <Ionicons name="add" size={32} color="#0B0F19" />
      </Pressable>
    </Animated.View>
  );
}




export default function HomeScreen({ navigation }: any) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { theme, fontSizes, isDarkMode } = useTheme();
  const { unreadCount, refreshUnread } = useNotifications();
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

  // Dynamic Members state
  const [onlineMembers, setOnlineMembers] = useState<MemberItem[]>([]);
  const scrollRef = useRef<ScrollView>(null);

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
    fetchOnlineMembers();
    refreshUnread();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchGroups(),
      fetchOnlineMembers(),
      fetchSavedGroups(),
      refreshUnread(),
    ]);
    setRefreshing(false);
  };

  const fetchOnlineMembers = async () => {
    try {
      let rawUsers: any[] = [];
      try {
        const res = await api.get("/users/all");
        if (res.data?.success && Array.isArray(res.data.users)) {
          rawUsers = res.data.users;
        }
      } catch {
        // Fallback: If /users/all endpoint fails or requires admin, fetch members from groups
        try {
          const res = await api.get("/groups");
          if (res.data?.success && Array.isArray(res.data.groups)) {
            const firstFew = res.data.groups.slice(0, 5);
            const memberPromises = firstFew.map((g: any) =>
              api.get(`/groups/${g.id}/members`).then((r) => r.data?.members || []).catch(() => [])
            );
            const results = await Promise.all(memberPromises);
            const userMap = new Map();
            results.flat().forEach((m: any) => {
              const uid = m.user_id || m.id;
              if (uid && !userMap.has(uid)) {
                userMap.set(uid, m);
              }
            });
            rawUsers = Array.from(userMap.values());
          }
        } catch {}
      }

      if (rawUsers.length > 0) {
        const ringColors = [
          "#F59E0B",
          "#10B981",
          "#8B5CF6",
          "#FF6B6B",
          "#38BDF8",
          "#EC4899",
          "#14B8A6",
          "#F97316",
        ];

        // Filter and map real backend users. Exclusively keep active or online users.
        const mapped: MemberItem[] = rawUsers
          .filter((u: any) => {
            return (
              u.is_online === true ||
              u.online === true ||
              u.is_online === 1 ||
              u.status === "active" ||
              u.is_active === true ||
              u.active === true
            );
          })
          .map((u: any, idx: number) => ({
            id: u.id || u.user_id || `user-${idx}`,
            name: u.name || u.username || "Member",
            avatarUrl: u.profile_pic || u.avatar_url || u.avatarUrl || u.avatar || undefined,
            ringColor: u.profile_color || ringColors[idx % ringColors.length],
            isOnline: true,
          }));

        if (mapped.length > 0) {
          setOnlineMembers(mapped);
        } else {
          // If the backend has no users explicitly flagged online, map active backend members as online
          const activeBackendUsers: MemberItem[] = rawUsers.slice(0, 10).map((u: any, idx: number) => ({
            id: u.id || u.user_id || `user-${idx}`,
            name: u.name || u.username || "Member",
            avatarUrl: u.profile_pic || u.avatar_url || u.avatarUrl || u.avatar || undefined,
            ringColor: u.profile_color || ringColors[idx % ringColors.length],
            isOnline: true,
          }));
          setOnlineMembers(activeBackendUsers);
        }
      }
    } catch (err) {
      console.log("Error fetching online members:", err);
    }
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
      setError("Failed to load groups. Please check your connection.");
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
      })
    );
    setJoinedGroups(joined);
    setPendingGroups(pending);
  };

  const toggleJoin = async (groupId: number) => {
    const wasJoined = joinedGroups.includes(groupId);
    const wasPending = pendingGroups.includes(groupId);
    const group = groups.find((g) => g.id === groupId);

    const updatedJoined = wasJoined
      ? joinedGroups.filter((id) => id !== groupId)
      : group?.require_approval
      ? joinedGroups
      : [...joinedGroups, groupId];

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
          : g
      )
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
      // Revert on error
      if (wasJoined) {
        setJoinedGroups((p) => [...p, groupId]);
      } else {
        setJoinedGroups((p) => p.filter((id) => id !== groupId));
        setPendingGroups((p) => p.filter((id) => id !== groupId));
      }
    } finally {
      setJoiningId(null);
    }
  };

  const toggleSave = async (groupId: number) => {
    const wasSaved = savedGroups.includes(groupId);
    if (wasSaved) {
      setSavedGroups((prev) => prev.filter((id) => id !== groupId));
    } else {
      setSavedGroups((prev) => [...prev, groupId]);
    }
    setSavingId(groupId);
    try {
      await api.post(`/users/saved/${groupId}`);
    } catch (err) {
      if (wasSaved) setSavedGroups((prev) => [...prev, groupId]);
      else setSavedGroups((prev) => prev.filter((id) => id !== groupId));
    } finally {
      setSavingId(null);
    }
  };

  const [quickFilter, setQuickFilter] = useState<"all" | "joined" | "saved">(
    "all",
  );
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const getJoinLabel = (id: number) => {
    if (joiningId === id) return "...";
    if (joinedGroups.includes(id)) return "✓ Joined";
    if (pendingGroups.includes(id)) return "⏳ Pending";
    return "Join";
  };

  const filtered = groups.filter((g) => {
    const catOk = activeCategory === "all" || g.category === activeCategory;
    const searchOk =
      search.trim().length === 0 ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description &&
        g.description.toLowerCase().includes(search.toLowerCase()));
    const filterOk =
      quickFilter === "all"
        ? true
        : quickFilter === "joined"
        ? joinedGroups.includes(g.id)
        : savedGroups.includes(g.id);
    return catOk && searchOk && filterOk;
  });

  const getIcon = (g: any) => CAT_ICONS[g.category] || "📌";
  const getColor = (g: any) =>
    g.color || CAT_COLORS[g.category] || theme.primary;

  // ── CONTENT ──
  const content = (
    <ScrollView
      ref={scrollRef}
      style={[styles.scroll, { backgroundColor: theme.bg }]}
      contentContainerStyle={[
        styles.scrollContent,
        !isMobile && styles.webMaxContent,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      {/* 1. Hero Welcome Banner & Statistics Widgets (At the very top) */}
      <FadeInView delay={0} direction="down">
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={
              isDarkMode
                ? ["#1E2938", "#111726"]
                : ["#EBF4FF", "#F4F7FC"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.heroCard,
              { borderColor: theme.borderLight },
              Shadows.sm,
            ]}
          >
            <View style={styles.heroTop}>
              <View style={styles.heroTextContainer}>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.campusPill,
                      { backgroundColor: theme.primaryLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.campusPillText,
                        { color: theme.primary },
                      ]}
                    >
                      🎓 Campus Life
                    </Text>
                  </View>
                </View>

                {/* Greeting with Lively Floating Bee */}
                <View style={styles.greetingRow}>
                  <Text
                    style={[
                      styles.greetingTitle,
                      { color: theme.text, fontSize: fontSizes.xl + 2 },
                    ]}
                  >
                    Welcome, {user?.name?.split(" ")[0] || "RIGHTEOUS"}!
                  </Text>
                  <FloatingBee size={24} style={{ marginLeft: 6 }} />
                </View>

                <Text
                  style={[
                    styles.greetingSubtitle,
                    {
                      color: theme.textSecondary,
                      fontSize: fontSizes.sm,
                    },
                  ]}
                >
                  Discover communities, study circles, and vibrant campus
                  activities.
                </Text>
              </View>

              {!isMobile && (
                <View style={styles.heroGraphic}>
                  <FloatingBee size={48} />
                </View>
              )}
            </View>

            {/* Quick Stats Bar with Interactive Filtering */}
            <View
              style={[
                styles.statsBar,
                {
                  backgroundColor: isDarkMode ? "#171A2E" : "#FFFFFF",
                  borderColor: theme.border,
                },
                Shadows.sm,
              ]}
            >
              <QuickStatItem
                label="Total Groups"
                value={groups.length}
                color={theme.primary}
                isActive={quickFilter === "all"}
                onPress={() => setQuickFilter("all")}
                fontSizes={fontSizes}
                theme={theme}
              />
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: theme.border },
                ]}
              />
              <QuickStatItem
                label="Joined"
                value={joinedGroups.length}
                color={theme.success}
                isActive={quickFilter === "joined"}
                onPress={() =>
                  setQuickFilter(quickFilter === "joined" ? "all" : "joined")
                }
                fontSizes={fontSizes}
                theme={theme}
              />
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: theme.border },
                ]}
              />
              <QuickStatItem
                label="Saved"
                value={savedGroups.length}
                color={theme.accent}
                isActive={quickFilter === "saved"}
                onPress={() =>
                  setQuickFilter(quickFilter === "saved" ? "all" : "saved")
                }
                fontSizes={fontSizes}
                theme={theme}
              />
            </View>
          </LinearGradient>
        </View>
      </FadeInView>

      {/* 2. Members Row with Colored Rings & Online Status Indicators */}
      <FadeInView delay={40} direction="up">
        <MemberAvatarRow
          title="Members"
          members={onlineMembers.length > 0 ? onlineMembers : undefined}
          onlineCount={onlineMembers.length}
        />
      </FadeInView>

      {/* Reactive Search Input Bar */}
      <FadeInView delay={80} direction="up">
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.card,
                borderColor: isSearchFocused ? theme.primary : theme.border,
              },
              isSearchFocused ? Shadows.md : Shadows.sm,
            ]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={isSearchFocused ? theme.primary : theme.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: theme.text, fontSize: fontSizes.md },
              ]}
              placeholder="Search groups by title or topic..."
              placeholderTextColor={theme.textTertiary}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                style={styles.clearSearchBtn}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </FadeInView>

      {/* Categories Horizontal Scroll */}
      <FadeInView delay={120} direction="up">
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catsContent}
            style={styles.catsScroll}
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                id={cat.id}
                label={cat.label}
                emoji={cat.emoji}
                icon={cat.icon}
                color={CAT_COLORS[cat.id]}
                isSelected={activeCategory === cat.id}
                onPress={() => setActiveCategory(cat.id)}
              />
            ))}
          </ScrollView>
        </View>
      </FadeInView>

      {/* Loading Skeleton Grid */}
      {loading && (
        <View style={styles.groupsContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, fontSize: fontSizes.lg },
                ]}
              >
                Finding campus groups...
              </Text>
            </View>
          </View>
          <View style={isMobile ? styles.mobileList : styles.webGrid}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} isMobile={isMobile} />
            ))}
          </View>
        </View>
      )}

      {/* Error State */}
      {!loading && error.length > 0 && (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text
            style={[
              styles.centerText,
              { color: theme.error, fontSize: fontSizes.md },
            ]}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.primary }]}
            onPress={fetchGroups}
          >
            <Text style={[styles.retryText, { fontSize: fontSizes.sm }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Groups Section */}
      {!loading && !error && (
        <View style={styles.groupsContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, fontSize: fontSizes.lg },
                ]}
              >
                {quickFilter === "joined"
                  ? "My Joined Groups"
                  : quickFilter === "saved"
                  ? "My Saved Groups"
                  : activeCategory === "all"
                  ? "Explore Groups"
                  : `${
                      activeCategory.charAt(0).toUpperCase() +
                      activeCategory.slice(1)
                    } Groups`}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    { color: theme.primary, fontSize: fontSizes.xs },
                  ]}
                >
                  {filtered.length}
                </Text>
              </View>
            </View>
          </View>

          {filtered.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="No groups found"
              description={
                search.length > 0
                  ? `No groups match "${search}". Try searching for something else.`
                  : quickFilter === "joined"
                  ? "You haven't joined any groups yet. Explore groups and tap Join!"
                  : quickFilter === "saved"
                  ? "You haven't bookmarked any groups yet. Tap the bookmark icon on any card!"
                  : "No groups available in this category yet. Be the first to create one!"
              }
              actionTitle={
                search.length > 0
                  ? "Clear Search"
                  : quickFilter !== "all"
                  ? "View All Groups"
                  : "Create Group"
              }
              onAction={
                search.length > 0
                  ? () => setSearch("")
                  : quickFilter !== "all"
                  ? () => setQuickFilter("all")
                  : () => navigation.navigate("CreateGroup")
              }
            />
          ) : (
            <View style={isMobile ? styles.mobileList : styles.webGrid}>
              {filtered.map((group, idx) => (
                <InteractiveGroupCard
                  key={group.id}
                  group={group}
                  idx={idx}
                  isMobile={isMobile}
                  groupColor={getColor(group)}
                  icon={getIcon(group)}
                  isJoined={joinedGroups.includes(group.id)}
                  isPending={pendingGroups.includes(group.id)}
                  isSaved={savedGroups.includes(group.id)}
                  savingId={savingId}
                  joiningId={joiningId}
                  onPress={() =>
                    navigation.navigate("GroupDetails", {
                      groupId: group.id,
                    })
                  }
                  onToggleSave={() => toggleSave(group.id)}
                  onToggleJoin={() => toggleJoin(group.id)}
                  joinLabel={getJoinLabel(group.id)}
                  theme={theme}
                  fontSizes={fontSizes}
                />
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ height: Spacing["3xl"] }} />
    </ScrollView>
  );

  // ── MOBILE LAYOUT WITH SLIDING DRAWER AND BOTTOM TAB BAR ──
  if (isMobile) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <View style={[styles.mobileRoot, { backgroundColor: theme.bg }]}>
          <MobileHeader
            title="Hive 🐝"
            onMenuPress={openDrawer}
            navigation={navigation}
          />

          <View style={{ flex: 1, position: "relative" }}>
            <ScreenTransition>
              {content}
            </ScreenTransition>
            <FloatingActionButton
              onPress={() => navigation.navigate("CreateGroup")}
              theme={theme}
            />
          </View>

          <BottomTabBar navigation={navigation} activeScreen="Home" />

          {/* Drawer Overlay */}
          {drawerOpen && (
            <TouchableWithoutFeedback onPress={closeDrawer}>
              <Animated.View
                style={[styles.overlay, { opacity: overlayOpacity }]}
              />
            </TouchableWithoutFeedback>
          )}

          {/* Drawer Sidebar */}
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

  // ── WEB & TABLET LAYOUT WITH PERSISTENT SIDEBAR ──
  return (
    <View style={[styles.webRoot, { backgroundColor: theme.bg }]}>
      <Sidebar navigation={navigation} activeScreen="Home" />
      <View style={[styles.webContentContainer, { position: "relative" }]}>
        <ScreenTransition>
          {content}
        </ScreenTransition>
        <FloatingActionButton
          onPress={() => navigation.navigate("CreateGroup")}
          theme={theme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  mobileRoot: { flex: 1 },
  webRoot: { flexDirection: "row", flex: 1 },
  webContentContainer: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingVertical: Spacing.md,
  },
  webMaxContent: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Spacing.xl,
  },

  // Hero Card
  heroWrapper: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heroCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  heroTextContainer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  campusPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  campusPillText: {
    fontWeight: "700",
    fontSize: 12,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingTitle: {
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  greetingSubtitle: {
    lineHeight: 20,
  },
  heroGraphic: {
    marginLeft: Spacing.lg,
  },
  heroEmojiLarge: {
    fontSize: 54,
  },

  // Stats Bar
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  statItemWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    width: "100%",
    paddingVertical: 2,
  },
  statValue: {
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 28,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  clearSearchBtn: {
    padding: Spacing.xs,
  },

  // Categories
  categoriesSection: {
    marginBottom: Spacing.md,
  },
  catsScroll: {
    paddingLeft: Spacing.lg,
  },
  catsContent: {
    paddingRight: Spacing.xl,
    paddingVertical: Spacing.xs,
  },

  // Groups
  groupsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  countBadgeText: {
    fontWeight: "700",
  },

  // Mobile Cards List
  mobileList: {
    gap: Spacing.md,
  },
  mobileCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },

  // Web Cards Grid
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
  },
  webCardWrapper: {
    width: "48%",
    minWidth: 300,
    flexGrow: 1,
  },
  webCard: {
    width: "100%",
    borderRadius: Radii.xl,
    borderWidth: 1,
    overflow: "hidden",
  },

  // Card Content
  cardHeaderStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: {
    fontSize: 18,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  categoryBadgeText: {
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  saveBtn: {
    padding: Spacing.xs,
  },
  cardBody: {
    padding: Spacing.md,
  },
  cardName: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tagPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  tagPillText: {
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: Spacing.sm + 2,
    marginTop: Spacing.xs,
  },
  membersMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  membersCountText: {
    fontWeight: "600",
  },
  joinActionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 84,
  },
  primaryJoinButton: {},
  joinedButton: {
    borderWidth: 1,
    borderColor: "transparent",
  },
  pendingButton: {
    borderWidth: 1,
    borderColor: "transparent",
  },
  joinButtonText: {
    fontWeight: "700",
  },

  // States
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing['3xl'],
  },
  centerText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  retryBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radii.md,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

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



  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
