import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../components/api";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";
import { useResponsive } from "../../components/useResponsive";
import WithDrawer from "../../components/withDrawer";

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

export default function GroupDetailsScreen({ navigation, route }: any) {
  const { groupId } = route?.params || {};
  const { theme, fontSizes } = useTheme();
  const { user } = useUser();
  const { isMobile, padding } = useResponsive();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const messagesScrollRef = useRef<ScrollView>(null);
  const pollingRef = useRef<any>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  const lastReadRef = useRef<string | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [groupId]);


  useEffect(() => {
    if (isMember || isCreator) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [isMember, isCreator]);

  useEffect(() => {
    if (activeTab === "chat" && (isMember || isCreator)) {
      lastMessageTimeRef.current = null;
      fetchMessages(true);
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [activeTab, isMember, isCreator]);

  const fetchAll = async () => {
    try {
      setLoading(true);

      // Fetch each resource independently so one failure doesn't block the rest
      const [groupRes, membersRes, announcementsRes, membershipRes] =
        await Promise.all([
          api.get(`/groups/${groupId}`).catch((err) => {
            console.log("Fetch group error:", err);
            return null;
          }),
          api.get(`/groups/${groupId}/members`).catch((err) => {
            console.log("Fetch members error:", err);
            return null;
          }),
          api.get(`/groups/${groupId}/announcements`).catch((err) => {
            console.log("Fetch announcements error:", err);
            return null;
          }),
          api.get(`/groups/${groupId}/membership`).catch((err) => {
            console.log("Fetch membership error:", err);
            return null;
          }),
        ]);

      if (groupRes?.data?.success) {
        setGroup(groupRes.data.group);
        setMemberCount(parseInt(groupRes.data.group.member_count) || 0);
      }
      if (membersRes?.data?.success) setMembers(membersRes.data.members);
      if (announcementsRes?.data?.success)
        setAnnouncements(announcementsRes.data.announcements);
      if (membershipRes?.data?.success) {
        setIsMember(membershipRes.data.isMember);
        setIsPending(membershipRes.data.isPending);
        setIsCreator(
          membershipRes.data.role === "admin" &&
            groupRes?.data?.group?.created_by === user?.id,
        );
        setIsGroupAdmin(membershipRes.data.role === "admin");
      }

      if (membershipRes?.data?.role === "admin") {
        try {
          const reqRes = await api.get(`/groups/${groupId}/join-requests`);
          if (reqRes.data.success) setJoinRequests(reqRes.data.requests);
        } catch {}
      }
    } catch (err) {
      console.log("Group details error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await api.post(`/groups/${groupId}/toggle-join`);
      if (res.data.success) {
        if (res.data.joined) {
          setIsMember(true);
          setIsPending(false);
          setMemberCount((prev) => prev + 1);
          // Refresh members list
          const membersRes = await api.get(`/groups/${groupId}/members`);
          if (membersRes.data.success) setMembers(membersRes.data.members);
        } else if (res.data.status === "pending") {
          setIsPending(true);
          setIsMember(false);
        }
      }
    } catch (err: any) {
      console.log("Join error:", err?.response?.data?.message);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setShowLeaveModal(false);
    setLeaving(true);
    try {
      const res = await api.post(`/groups/${groupId}/toggle-join`);
      if (res.data.success && !res.data.joined) {
        setIsMember(false);
        setIsPending(false);
        setMemberCount((prev) => Math.max(0, prev - 1));
        // Refresh members list
        const membersRes = await api.get(`/groups/${groupId}/members`);
        if (membersRes.data.success) setMembers(membersRes.data.members);
      }
    } catch (err: any) {
      console.log("Leave error:", err?.response?.data?.message);
    } finally {
      setLeaving(false);
    }
  };

  const cancelRequest = async () => {
    setJoining(true);
    try {
      const res = await api.post(`/groups/${groupId}/toggle-join`);
      if (res.data.success) {
        setIsPending(false);
        setIsMember(false);
      }
    } catch (err) {
      console.log("Cancel request error:", err);
    } finally {
      setJoining(false);
    }
  };

  const handleApproveRequest = async (userId: number) => {
    try {
      await api.put(`/groups/${groupId}/members/${userId}/approve`);
      setJoinRequests((prev) => prev.filter((r) => r.user_id !== userId));
      setMemberCount((prev) => prev + 1);
      const membersRes = await api.get(`/groups/${groupId}/members`);
      if (membersRes.data.success) setMembers(membersRes.data.members);
    } catch (err) {
      console.log("Approve error:", err);
    }
  };

  const handleRejectRequest = async (userId: number) => {
    try {
      await api.put(`/groups/${groupId}/members/${userId}/reject`);
      setJoinRequests((prev) => prev.filter((r) => r.user_id !== userId));
    } catch (err) {
      console.log("Reject error:", err);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await api.delete(`/groups/${groupId}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setMemberCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.log("Remove member error:", err);
    }
  };

  const handleDeleteGroup = async () => {
    setDeleting(true);
    try {
      await api.delete(`/groups/${groupId}`);
      setShowDeleteModal(false);
      navigation.navigate("Home");
    } catch (err) {
      console.log("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const fetchMessages = async (initial = false) => {
    try {
      if (initial) {
        setLoadingMessages(true);
        lastMessageTimeRef.current = null;
      }
      const url = lastMessageTimeRef.current
        ? `/groups/${groupId}/messages?since=${encodeURIComponent(lastMessageTimeRef.current)}`
        : `/groups/${groupId}/messages`;

      const res = await api.get(url);
      if (res.data.success) {
        const newMessages = res.data.messages || [];
        if (initial) {
          setMessages(newMessages);
        } else if (newMessages.length > 0) {
          // Only add truly new messages not already in state
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m: any) => m.id));
            const actuallyNew = newMessages.filter(
              (m: any) => !existingIds.has(m.id),
            );
            if (actuallyNew.length === 0) return prev;
            return [...prev, ...actuallyNew];
          });
        }
        // Update the last message timestamp
        if (newMessages.length > 0) {
          const last = newMessages[newMessages.length - 1];
          lastMessageTimeRef.current = last.created_at;
        }
        if (initial || newMessages.length > 0) {
          setTimeout(
            () =>
              messagesScrollRef.current?.scrollToEnd({ animated: !initial }),
            150,
          );
        }
      }
    } catch (err) {
      console.log("Fetch messages error:", err);
    } finally {
      if (initial) setLoadingMessages(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      if (!isMember && !isCreator) return;
      const url = lastReadRef.current
        ? `/groups/${groupId}/messages/unread-count?last_read=${encodeURIComponent(lastReadRef.current)}`
        : `/groups/${groupId}/messages/unread-count`;
      const res = await api.get(url);
      if (res.data.success) setUnreadMessages(res.data.count);
    } catch {}
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      if (isMember || isCreator) {
        await fetchMessages(false);
      }
    }, 4000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sendingMessage) return;
    const text = messageText.trim();
    setMessageText("");
    setSendingMessage(true);
    try {
      const res = await api.post(`/groups/${groupId}/messages`, {
        content: text,
      });
      if (res.data.success) {
        const newMsg = res.data.message;
        // Add message only if not already in list
        setMessages((prev) => {
          const exists = prev.some((m: any) => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
        lastMessageTimeRef.current = newMsg.created_at;
        setTimeout(
          () => messagesScrollRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }
    } catch (err) {
      console.log("Send message error:", err);
      setMessageText(text);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateDivider = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getColor = () =>
    group?.color || CAT_COLORS[group?.category] || "#4C9BE8";
  const getIcon = () => CAT_ICONS[group?.category] || "📌";
  const getRoleColor = (role: string) => {
    if (role === "admin") return "#00467F";
    if (role === "moderator") return "#845EF7";
    return "#51CF66";
  };

  if (loading) {
    return (
      <WithDrawer
        navigation={navigation}
        activeScreen=""
        title="Group Details"
        showBack
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00467F" />
          <Text style={[styles.centerText, { color: theme.subText }]}>
            Loading group...
          </Text>
        </View>
      </WithDrawer>
    );
  }

  if (!group) {
    return (
      <WithDrawer
        navigation={navigation}
        activeScreen=""
        title="Group Details"
        showBack
      >
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Group not found
          </Text>
          <TouchableOpacity
            style={styles.goBackBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </WithDrawer>
    );
  }

  return (
    <WithDrawer
      navigation={navigation}
      activeScreen=""
      title={group.name}
      showBack
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={[styles.scroll, { backgroundColor: theme.bg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <View style={[styles.hero, { backgroundColor: getColor() }]}>
            <LinearGradient
              colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.6)"]}
              style={styles.heroOverlay}
            />

            {/* Chat Button — top right */}
            {(isMember || isCreator) && (
              <TouchableOpacity
                style={styles.heroChatBtn}
                onPress={() => {
                  setUnreadMessages(0);
                  lastReadRef.current = new Date().toISOString();
                  navigation.navigate("GroupChat", {
                    groupId,
                    groupName: group.name,
                    groupColor: getColor(),
                    groupCategory: group.category,
                    isAdmin: isGroupAdmin,
                  });
                }}
              >
                <Ionicons name="chatbubbles" size={22} color="#fff" />
                {unreadMessages > 0 && (
                  <View style={styles.chatUnreadBadge}>
                    <Text style={styles.chatUnreadText}>
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.heroTop}>
              <Text style={styles.heroEmoji}>{getIcon()}</Text>
              <View style={styles.heroInfo}>
                <Text style={[styles.heroName, { fontSize: fontSizes.xl }]}>
                  {group.name}
                </Text>
                <View style={styles.heroBadges}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="people-outline" size={12} color="#fff" />
                    <Text style={styles.heroBadgeText}>
                      {memberCount} members
                    </Text>
                  </View>
                  <View style={styles.heroBadge}>
                    <Ionicons name="apps-outline" size={12} color="#fff" />
                    <Text style={styles.heroBadgeText}>{group.category}</Text>
                  </View>
                  {group.is_private && (
                    <View style={styles.heroBadge}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={12}
                        color="#fff"
                      />
                      <Text style={styles.heroBadgeText}>Private</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.heroActions}>
              {/* NOT A MEMBER — show Join button */}
              {!isMember && !isPending && !isCreator && (
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={handleJoin}
                  disabled={joining}
                >
                  {joining ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <>
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color={theme.primary}
                      />
                      <Text style={[styles.joinBtnText, { color: theme.primary }]}>Join Group</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* PENDING — show Cancel Request button */}
              {isPending && !isCreator && (
                <TouchableOpacity
                  style={styles.pendingBtn}
                  onPress={cancelRequest}
                  disabled={joining}
                >
                  {joining ? (
                    <ActivityIndicator size="small" color="#F59F00" />
                  ) : (
                    <>
                      <Ionicons name="time-outline" size={18} color="#F59F00" />
                      <Text style={styles.pendingBtnText}>
                        ⏳ Pending — Tap to Cancel
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* MEMBER — show Leave Group button */}
              {isMember && !isCreator && (
                <TouchableOpacity
                  style={styles.leaveBtn}
                  onPress={() => setShowLeaveModal(true)}
                  disabled={leaving}
                >
                  {leaving ? (
                    <ActivityIndicator size="small" color="#FF6B6B" />
                  ) : (
                    <>
                      <Ionicons name="exit-outline" size={18} color="#FF6B6B" />
                      <Text style={styles.leaveBtnText}>Leave Group</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* CREATOR badge */}
              {isCreator && (
                <View style={styles.creatorBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#fff" />
                  <Text style={styles.creatorBadgeText}>
                    You are the Group Admin
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Info */}
          <View style={[styles.quickInfoRow, { paddingHorizontal: padding }]}>
            {[
              {
                icon: "time-outline",
                color: "#4C9BE8",
                label: "Meets",
                value: group.meeting_time || "TBD",
              },
              {
                icon: "location-outline",
                color: "#51CF66",
                label: "Location",
                value: group.location || "TBD",
              },
              {
                icon: "repeat-outline",
                color: "#845EF7",
                label: "Frequency",
                value: group.meeting_frequency || "TBD",
              },
              {
                icon: "people-outline",
                color: "#FFB347",
                label: "Members",
                value: `${memberCount}`,
              },
            ].map((item, i) => (
              <View
                key={i}
                style={[
                  styles.quickCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.quickCardIcon,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={item.color}
                  />
                </View>
                <Text
                  style={[
                    styles.quickCardLabel,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.quickCardValue,
                    { color: theme.text, fontSize: fontSizes.xs },
                  ]}
                  numberOfLines={1}
                >
                  {item.value}
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
              {
                id: "about",
                label: "About",
                icon: "information-circle-outline",
              },
              {
                id: "members",
                label: `Members (${memberCount})`,
                icon: "people-outline",
              },
              {
                id: "announcements",
                label: "Posts",
                icon: "megaphone-outline",
              },
              ...(isGroupAdmin
                ? [
                    {
                      id: "requests",
                      label: `Requests${joinRequests.length > 0 ? ` (${joinRequests.length})` : ""}`,
                      icon: "person-add-outline",
                    },
                  ]
                : []),
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabChip,
                  { borderColor: theme.border, backgroundColor: theme.card },
                  activeTab === tab.id && [
                    styles.tabChipActive,
                    { backgroundColor: theme.primary, borderColor: theme.primary },
                  ],
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
                {tab.id === "requests" && joinRequests.length > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>
                      {joinRequests.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.tabContent, { paddingHorizontal: padding }]}>
            {/* ── ABOUT TAB ── */}
            {activeTab === "about" && (
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
                    About this Group
                  </Text>
                  <Text
                    style={[
                      styles.cardBody,
                      {
                        color: theme.subText,
                        fontSize: fontSizes.sm,
                        lineHeight: 22,
                      },
                    ]}
                  >
                    {group.description}
                  </Text>
                  {group.tags && group.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {group.tags.map((tag: string, i: number) => (
                        <View
                          key={i}
                          style={[
                            styles.tag,
                            { backgroundColor: getColor() + "20" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              { color: getColor(), fontSize: fontSizes.xs },
                            ]}
                          >
                            #{tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Group Details */}
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
                    Group Details
                  </Text>
                  {[
                    {
                      icon: "location-outline",
                      label: "Location",
                      value: group.location || "Not specified",
                    },
                    {
                      icon: "time-outline",
                      label: "Meets",
                      value: group.meeting_time || "Not specified",
                    },
                    {
                      icon: "repeat-outline",
                      label: "Frequency",
                      value: group.meeting_frequency || "Not specified",
                    },
                    {
                      icon: "people-outline",
                      label: "Max Members",
                      value: group.max_members
                        ? `${group.max_members}`
                        : "Unlimited",
                    },
                    {
                      icon: "shield-outline",
                      label: "Privacy",
                      value: group.is_private ? "Private" : "Public",
                    },
                    {
                      icon: "checkmark-circle-outline",
                      label: "Approval",
                      value: group.require_approval
                        ? "Required"
                        : "Auto-approved",
                    },
                  ].map((item, i, arr) => (
                    <View
                      key={i}
                      style={[
                        styles.detailRow,
                        { borderBottomColor: theme.border },
                        i < arr.length - 1 && { borderBottomWidth: 1 },
                      ]}
                    >
                      <View
                        style={[
                          styles.detailIcon,
                          { backgroundColor: getColor() + "20" },
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={15}
                          color={getColor()}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.detailLabel,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            { color: theme.text, fontSize: fontSizes.sm },
                          ]}
                        >
                          {item.value}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Leave Group Card — for members */}
                {isMember && !isCreator && (
                  <View
                    style={[
                      styles.card,
                      { backgroundColor: "#FFF5F5", borderColor: "#FFD0D0" },
                    ]}
                  >
                    <Text style={styles.leaveCardTitle}>Leave this Group?</Text>
                    <Text style={styles.leaveCardDesc}>
                      You can always rejoin later unless the group requires
                      approval.
                    </Text>
                    <TouchableOpacity
                      style={styles.leaveCardBtn}
                      onPress={() => setShowLeaveModal(true)}
                    >
                      <Ionicons name="exit-outline" size={16} color="#FF6B6B" />
                      <Text style={styles.leaveCardBtnText}>Leave Group</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Delete Group Card — for creator */}
                {isCreator && (
                  <View
                    style={[
                      styles.card,
                      { backgroundColor: "#FFF5F5", borderColor: "#FFD0D0" },
                    ]}
                  >
                    <Text style={styles.leaveCardTitle}>⚠️ Danger Zone</Text>
                    <Text style={styles.leaveCardDesc}>
                      Deleting this group will permanently remove all members,
                      announcements and data.
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteGroupBtn}
                      onPress={() => setShowDeleteModal(true)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#FF6B6B"
                      />
                      <Text style={styles.leaveCardBtnText}>Delete Group</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* ── MEMBERS TAB ── */}
            {activeTab === "members" && (
              <View style={styles.section}>
                <View
                  style={[
                    styles.card,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.cardTitleRow}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: theme.text, fontSize: fontSizes.lg },
                      ]}
                    >
                      Members ({memberCount})
                    </Text>
                  </View>
                  {members.length === 0 ? (
                    <View style={styles.miniCenter}>
                      <Text
                        style={[styles.centerText, { color: theme.subText }]}
                      >
                        No members yet
                      </Text>
                    </View>
                  ) : (
                    members.map((member, i) => (
                      <View
                        key={member.user_id || i}
                        style={[
                          styles.memberRow,
                          { borderBottomColor: theme.border },
                          i < members.length - 1 && { borderBottomWidth: 1 },
                        ]}
                      >
                        {member.profile_picture ? (
                          <Image
                            source={{ uri: member.profile_picture }}
                            style={styles.memberAvatar}
                          />
                        ) : (
                          <View
                            style={[
                              styles.memberAvatarFallback,
                              {
                                backgroundColor:
                                  member.profile_color || "#00467F",
                              },
                            ]}
                          >
                            <Text style={styles.memberAvatarText}>
                              {(member.name || "U")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.memberName,
                              { color: theme.text, fontSize: fontSizes.sm },
                            ]}
                          >
                            {member.name}
                            {member.user_id === user?.id && (
                              <Text style={{ color: "#00467F" }}> (You)</Text>
                            )}
                          </Text>
                          <Text
                            style={[
                              styles.memberDept,
                              { color: theme.subText, fontSize: fontSizes.xs },
                            ]}
                          >
                            {member.department}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.roleBadge,
                            {
                              backgroundColor: getRoleColor(member.role) + "20",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleText,
                              {
                                color: getRoleColor(member.role),
                                fontSize: fontSizes.xs,
                              },
                            ]}
                          >
                            {member.role}
                          </Text>
                        </View>
                        {/* Remove button — admin only, not on self, not on other admins */}
                        {isGroupAdmin &&
                          member.user_id !== user?.id &&
                          member.role !== "admin" && (
                            <TouchableOpacity
                              style={styles.removeMemberBtn}
                              onPress={() => handleRemoveMember(member.user_id)}
                            >
                              <Ionicons
                                name="person-remove-outline"
                                size={18}
                                color="#FF6B6B"
                              />
                            </TouchableOpacity>
                          )}
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}

            {/* ── ANNOUNCEMENTS TAB ── */}
            {activeTab === "announcements" && (
              <View style={styles.section}>
                {announcements.length === 0 ? (
                  <View style={styles.center}>
                    <Text style={styles.emptyEmoji}>📢</Text>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>
                      No posts yet
                    </Text>
                    <Text style={[styles.centerText, { color: theme.subText }]}>
                      Group announcements will appear here
                    </Text>
                  </View>
                ) : (
                  announcements.map((ann, i) => (
                    <View
                      key={ann.id || i}
                      style={[
                        styles.card,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <View style={styles.annHeader}>
                        <View
                          style={[
                            styles.annAvatar,
                            { backgroundColor: getColor() },
                          ]}
                        >
                          <Text style={styles.annAvatarText}>
                            {(ann.author_name || "A").charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.annAuthor,
                              { color: theme.text, fontSize: fontSizes.sm },
                            ]}
                          >
                            {ann.author_name || "Admin"}
                          </Text>
                          <Text
                            style={[
                              styles.annDate,
                              { color: theme.subText, fontSize: fontSizes.xs },
                            ]}
                          >
                            {new Date(ann.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.annTitle,
                          { color: theme.text, fontSize: fontSizes.md },
                        ]}
                      >
                        {ann.title}
                      </Text>
                      <Text
                        style={[
                          styles.annContent,
                          { color: theme.subText, fontSize: fontSizes.sm },
                        ]}
                      >
                        {ann.content}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ── REQUESTS TAB ── */}
            {activeTab === "requests" && isGroupAdmin && (
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
                    Join Requests ({joinRequests.length})
                  </Text>
                  {joinRequests.length === 0 ? (
                    <View style={styles.miniCenter}>
                      <Text style={{ fontSize: 32 }}>✅</Text>
                      <Text
                        style={[styles.centerText, { color: theme.subText }]}
                      >
                        No pending requests
                      </Text>
                    </View>
                  ) : (
                    joinRequests.map((req, i) => (
                      <View
                        key={req.user_id || i}
                        style={[
                          styles.requestRow,
                          { borderBottomColor: theme.border },
                          i < joinRequests.length - 1 && {
                            borderBottomWidth: 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.memberAvatarFallback,
                            {
                              backgroundColor: req.profile_color || "#00467F",
                            },
                          ]}
                        >
                          <Text style={styles.memberAvatarText}>
                            {(req.name || "U")
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
                              styles.memberName,
                              { color: theme.text, fontSize: fontSizes.sm },
                            ]}
                          >
                            {req.name}
                          </Text>
                          <Text
                            style={[
                              styles.memberDept,
                              { color: theme.subText, fontSize: fontSizes.xs },
                            ]}
                          >
                            {req.department} • {req.level}
                          </Text>
                        </View>
                        <View style={styles.requestBtns}>
                          <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => handleApproveRequest(req.user_id)}
                          >
                            <Ionicons name="checkmark" size={16} color="#fff" />
                            <Text style={styles.approveBtnText}>Accept</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => handleRejectRequest(req.user_id)}
                          >
                            <Ionicons name="close" size={16} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── LEAVE MODAL ── */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={[styles.modalIconBox, { backgroundColor: "#FFF0F0" }]}>
              <Ionicons name="exit-outline" size={32} color="#FF6B6B" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Leave Group?
            </Text>
            <Text style={[styles.modalMsg, { color: theme.subText }]}>
              Are you sure you want to leave{" "}
              <Text style={{ fontWeight: "bold", color: theme.text }}>
                {group?.name}
              </Text>
              ?{"\n\n"}
              {group?.require_approval
                ? "You will need admin approval to rejoin."
                : "You can rejoin anytime."}
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.inputBg,
                  },
                ]}
                onPress={() => setShowLeaveModal(false)}
              >
                <Text
                  style={[styles.modalCancelText, { color: theme.subText }]}
                >
                  Stay
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmLeaveBtn}
                onPress={handleLeave}
              >
                <Ionicons name="exit-outline" size={16} color="#fff" />
                <Text style={styles.modalConfirmText}>Yes, Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── DELETE MODAL ── */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={[styles.modalIconBox, { backgroundColor: "#FFF0F0" }]}>
              <Ionicons name="trash-outline" size={32} color="#FF6B6B" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Delete Group?
            </Text>
            <Text style={[styles.modalMsg, { color: theme.subText }]}>
              This will permanently delete{" "}
              <Text style={{ fontWeight: "bold", color: theme.text }}>
                {group?.name}
              </Text>{" "}
              and all its data.{"\n\n"}This action cannot be undone.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.inputBg,
                  },
                ]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text
                  style={[styles.modalCancelText, { color: theme.subText }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmDeleteBtn,
                  deleting && { opacity: 0.6 },
                ]}
                onPress={handleDeleteGroup}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.modalConfirmText}>Yes, Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  miniCenter: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "bold" },
  goBackBtn: {
    backgroundColor: "#00467F",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goBackBtnText: { color: "#fff", fontWeight: "600" },

  // ── CHAT ──
  chatContainer: {
    flex: 1,
  },
  chatInner: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexGrow: 1,
  },
  noMessages: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  noMessagesText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
  },
  dateLine: { flex: 1, height: 1 },
  dateDividerText: { fontSize: 11, fontWeight: "600" },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  messageRowMe: { justifyContent: "flex-end" },
  messageRowOther: { justifyContent: "flex-start" },

  messageAvatarBox: {
    width: 34,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  messageAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
  },
  messageAvatarSpacer: { width: 32 },

  messageBubbleWrap: { maxWidth: "75%", gap: 2 },
  messageBubbleWrapMe: { alignItems: "flex-end" },
  messageBubbleWrapOther: { alignItems: "flex-start" },

  messageSender: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
    paddingLeft: 14,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 3,
  },
  messageBubbleMe: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleMeFirst: { borderTopRightRadius: 18 },
  bubbleOtherFirst: { borderTopLeftRadius: 18 },

  messageText: { lineHeight: 20 },
  messageTime: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 2,
  },

  inputBar: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputBarInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    maxHeight: 100,
    lineHeight: 20,
    paddingTop: 2,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  joinChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 12,
  },
  joinChatBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  chatFloatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    height: 52,
    marginTop: 8,
    elevation: 4,
  },
  chatFloatBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  // Hero
  hero: {
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: "relative",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  heroChatBtn: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  chatUnreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  chatUnreadText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 16,
  },
  heroEmoji: { fontSize: 48 },
  heroInfo: { flex: 1 },
  heroName: { fontWeight: "bold", color: "#fff", marginBottom: 10 },
  heroBadges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: { color: "#fff", fontSize: 11, fontWeight: "500" },

  // Action buttons
  heroActions: { gap: 10 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    elevation: 2,
  },
  joinBtnText: { color: "#00467F", fontSize: 15, fontWeight: "bold" },
  pendingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#FFB347",
  },
  pendingBtnText: { color: "#F59F00", fontSize: 14, fontWeight: "600" },
  leaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#FFD0D0",
  },
  leaveBtnText: { color: "#FF6B6B", fontSize: 14, fontWeight: "600" },
  creatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 10,
  },
  creatorBadgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Quick Info
  quickInfoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 4,
  },
  quickCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    elevation: 1,
  },
  quickCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quickCardLabel: {},
  quickCardValue: { fontWeight: "600", textAlign: "center" },

  // Tabs
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
  section: { gap: 14 },

  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 12,
    elevation: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontWeight: "bold" },
  cardBody: {},

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontWeight: "600" },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: { marginBottom: 1 },
  detailValue: { fontWeight: "500" },

  // Leave/Delete cards
  leaveCardTitle: { fontSize: 14, fontWeight: "bold", color: "#FF6B6B" },
  leaveCardDesc: { fontSize: 12, color: "#888", lineHeight: 18 },
  leaveCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  leaveCardBtnText: { color: "#FF6B6B", fontSize: 13, fontWeight: "600" },
  deleteGroupBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  // Members
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  memberAvatar: { width: 44, height: 44, borderRadius: 22 },
  memberAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  memberName: { fontWeight: "600", marginBottom: 2 },
  memberDept: {},
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  roleText: { fontWeight: "600", textTransform: "capitalize" },
  removeMemberBtn: { padding: 6, marginLeft: 4 },

  // Announcements
  annHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  annAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  annAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  annAuthor: { fontWeight: "600" },
  annDate: {},
  annTitle: { fontWeight: "bold" },
  annContent: { lineHeight: 22 },

  // Join Requests
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  requestBtns: { flexDirection: "row", gap: 8, alignItems: "center" },
  approveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#51CF66",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  approveBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFD0D0",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    borderRadius: 20,
    padding: 28,
    width: 320,
    alignItems: "center",
    elevation: 20,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  modalCancelText: { fontSize: 14, fontWeight: "600" },
  modalConfirmLeaveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#FF6B6B",
  },
  modalConfirmDeleteBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#FF6B6B",
  },
  modalConfirmText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
