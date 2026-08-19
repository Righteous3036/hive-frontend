import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";

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

export default function GroupChatScreen({ navigation, route }: any) {
  const { groupId, groupName, groupColor, groupCategory, isAdmin } =
    route.params;
  const { theme, fontSizes } = useTheme();
  const { user } = useUser();

  const color = groupColor || CAT_COLORS[groupCategory] || "#00467F";

  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<any>(null);
  const lastTimeRef = useRef<string | null>(null);
  const msgIdsRef = useRef<Set<any>>(new Set());

  useEffect(() => {
    fetchMessages(true);
    return () => stopPolling();
  }, []);

  const fetchMessages = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const url = lastTimeRef.current
        ? `/groups/${groupId}/messages?since=${encodeURIComponent(lastTimeRef.current)}`
        : `/groups/${groupId}/messages`;
      const res = await api.get(url);
      if (res.data.success) {
        const newMsgs = res.data.messages || [];
        if (initial) {
          setMessages(newMsgs);
          msgIdsRef.current = new Set(newMsgs.map((m: any) => m.id));
        } else {
          const fresh = newMsgs.filter(
            (m: any) => !msgIdsRef.current.has(m.id),
          );
          if (fresh.length > 0) {
            fresh.forEach((m: any) => msgIdsRef.current.add(m.id));
            setMessages((prev) => [...prev, ...fresh]);
            setTimeout(
              () => flatListRef.current?.scrollToEnd({ animated: true }),
              100,
            );
          }
        }
        if (newMsgs.length > 0) {
          lastTimeRef.current = newMsgs[newMsgs.length - 1].created_at;
        }
        if (initial) {
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: false }),
            200,
          );
          startPolling();
        }
      }
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const startPolling = () => {
    pollingRef.current = setInterval(() => fetchMessages(false), 3000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;
    const text = messageText.trim();
    const replyId = replyTo?.id || null;
    setMessageText("");
    setReplyTo(null);
    setSending(true);
    try {
      const res = await api.post(`/groups/${groupId}/messages`, {
        content: text,
        reply_to_id: replyId,
      });
      if (res.data.success) {
        const newMsg = res.data.message;
        if (!msgIdsRef.current.has(newMsg.id)) {
          msgIdsRef.current.add(newMsg.id);
          setMessages((prev) => [...prev, newMsg]);
          lastTimeRef.current = newMsg.created_at;
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: true }),
            100,
          );
        }
      }
    } catch (err) {
      console.log("Send error:", err);
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (msgId: number) => {
    try {
      await api.delete(`/groups/${groupId}/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      msgIdsRef.current.delete(msgId);
      setShowMsgMenu(false);
    } catch (err: any) {
      console.log("Delete error:", err?.response?.data || err?.message);
    }
  };

  const clearChat = async () => {
    try {
      await api.delete(`/groups/${groupId}/messages/clear-all`);
      setMessages([]);
      msgIdsRef.current.clear();
      lastTimeRef.current = null;
      setShowClearConfirm(false);
    } catch (err: any) {
      console.log("Clear error:", err?.response?.data || err?.message);
    }
  };

  const onLongPressMessage = (msg: any) => {
    setSelectedMsg(msg);
    setShowMsgMenu(true);
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) =>
    (name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const renderItem = ({ item, index }: any) => {
    const isMe = Number(item.user_id) === Number(user?.id);
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

    const showDate =
      !prevMsg ||
      new Date(item.created_at).toDateString() !==
        new Date(prevMsg.created_at).toDateString();
    const isFirstInGroup =
      !prevMsg || Number(prevMsg.user_id) !== Number(item.user_id) || showDate;
    const isLastInGroup =
      !nextMsg || Number(nextMsg.user_id) !== Number(item.user_id);

    return (
      <View>
        {showDate && (
          <View style={styles.dateDivider}>
            <View
              style={[styles.dateLine, { backgroundColor: theme.border }]}
            />
            <Text
              style={[
                styles.dateText,
                { color: theme.subText, fontSize: fontSizes.xs },
              ]}
            >
              {formatDate(item.created_at)}
            </Text>
            <View
              style={[styles.dateLine, { backgroundColor: theme.border }]}
            />
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isMe ? styles.rowMe : styles.rowOther,
            { marginBottom: isLastInGroup ? 8 : 2 },
          ]}
        >
          {/* Avatar */}
          {!isMe && (
            <View style={styles.avatarBox}>
              {isLastInGroup ? (
                item.profile_picture ? (
                  <Image
                    source={{ uri: item.profile_picture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarFallback,
                      {
                        backgroundColor: item.profile_color || color,
                      },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(item.name)}
                    </Text>
                  </View>
                )
              ) : (
                <View style={styles.avatarSpacer} />
              )}
            </View>
          )}

          {/* Bubble */}
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => onLongPressMessage(item)}
            onPress={() => {}}
            style={[
              styles.bubbleWrap,
              isMe ? styles.bubbleWrapMe : styles.bubbleWrapOther,
            ]}
          >
            {/* Sender name */}
            {!isMe && isFirstInGroup && (
              <Text
                style={[styles.senderName, { color, fontSize: fontSizes.xs }]}
              >
                {item.name}
              </Text>
            )}

            <View
              style={[
                styles.bubble,
                isMe
                  ? { backgroundColor: color, borderBottomRightRadius: 4 }
                  : {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      borderWidth: 1,
                      borderBottomLeftRadius: 4,
                    },
              ]}
            >
              {/* Reply preview */}
              {item.reply_to_id && item.reply_content && (
                <View
                  style={[
                    styles.replyPreview,
                    {
                      backgroundColor: isMe
                        ? "rgba(0,0,0,0.15)"
                        : theme.inputBg,
                      borderLeftColor: isMe ? "#fff" : color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.replyPreviewSender,
                      {
                        color: isMe ? "rgba(255,255,255,0.9)" : color,
                        fontSize: fontSizes.xs,
                      },
                    ]}
                  >
                    {item.reply_sender_name}
                  </Text>
                  <Text
                    style={[
                      styles.replyPreviewText,
                      {
                        color: isMe ? "rgba(255,255,255,0.75)" : theme.subText,
                        fontSize: fontSizes.xs,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.reply_content}
                  </Text>
                </View>
              )}

              <Text
                style={[
                  styles.msgText,
                  { color: isMe ? "#fff" : theme.text, fontSize: fontSizes.sm },
                ]}
              >
                {item.content}
              </Text>
              <Text
                style={[
                  styles.msgTime,
                  { color: isMe ? "rgba(255,255,255,0.65)" : theme.subText },
                ]}
              >
                {formatTime(item.created_at)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text
            style={[styles.headerTitle, { fontSize: fontSizes.md }]}
            numberOfLines={1}
          >
            {groupName}
          </Text>
          <Text style={styles.headerSub}>Group Chat</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setShowClearConfirm(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.bg }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={color} />
            <Text style={[styles.centerText, { color: theme.subText }]}>
              Loading messages...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `msg-${item.id}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.listEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>👋</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No messages yet
                </Text>
                <Text style={[styles.emptyDesc, { color: theme.subText }]}>
                  Be the first to say hello!
                </Text>
              </View>
            }
          />
        )}

        {/* Reply Banner */}
        {replyTo && (
          <View
            style={[
              styles.replyBanner,
              {
                backgroundColor: theme.card,
                borderLeftColor: color,
                borderTopColor: theme.border,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.replyBannerSender,
                  { color, fontSize: fontSizes.xs },
                ]}
              >
                Replying to {replyTo.name}
              </Text>
              <Text
                style={[
                  styles.replyBannerText,
                  { color: theme.subText, fontSize: fontSizes.xs },
                ]}
                numberOfLines={1}
              >
                {replyTo.content}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Ionicons name="close" size={18} color={theme.subText} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputInner,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                { color: theme.text, fontSize: fontSizes.sm },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={theme.subText}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: color },
                (!messageText.trim() || sending) && { opacity: 0.4 },
              ]}
              onPress={sendMessage}
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Message Action Menu */}
      <Modal
        visible={showMsgMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMsgMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMsgMenu(false)}
        >
          <View style={[styles.menuBox, { backgroundColor: theme.card }]}>
            {/* Preview */}
            {selectedMsg && (
              <View style={[styles.menuPreview, { borderColor: theme.border }]}>
                <Text style={[styles.menuPreviewSender, { color }]}>
                  {selectedMsg.name}
                </Text>
                <Text
                  style={[styles.menuPreviewText, { color: theme.subText }]}
                  numberOfLines={2}
                >
                  {selectedMsg.content}
                </Text>
              </View>
            )}

            {/* Reply */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.border }]}
              onPress={() => {
                setReplyTo(selectedMsg);
                setShowMsgMenu(false);
              }}
            >
              <View
                style={[styles.menuItemIcon, { backgroundColor: "#4C9BE820" }]}
              >
                <Ionicons
                  name="return-down-forward-outline"
                  size={20}
                  color="#4C9BE8"
                />
              </View>
              <Text
                style={[
                  styles.menuItemText,
                  { color: theme.text, fontSize: fontSizes.sm },
                ]}
              >
                Reply
              </Text>
            </TouchableOpacity>

            {/* Delete — own message or admin */}
            {selectedMsg &&
              (Number(selectedMsg.user_id) === Number(user?.id) || isAdmin) && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    deleteMessage(selectedMsg.id);
                    setShowMsgMenu(false);
                  }}
                >
                  <View
                    style={[
                      styles.menuItemIcon,
                      { backgroundColor: "#FF6B6B20" },
                    ]}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  </View>
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: "#FF6B6B", fontSize: fontSizes.sm },
                    ]}
                  >
                    {Number(selectedMsg?.user_id) === Number(user?.id)
                      ? "Delete Message"
                      : "Remove Message"}
                  </Text>
                </TouchableOpacity>
              )}

            {/* Cancel */}
            <TouchableOpacity
              style={[styles.cancelBtn, { borderTopColor: theme.border }]}
              onPress={() => setShowMsgMenu(false)}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: theme.subText, fontSize: fontSizes.sm },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Clear Chat Confirm */}
      <Modal
        visible={showClearConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmBox, { backgroundColor: theme.card }]}>
            <View style={styles.confirmIcon}>
              <Ionicons name="trash-outline" size={32} color="#FF6B6B" />
            </View>
            <Text style={[styles.confirmTitle, { color: theme.text }]}>
              Clear Chat?
            </Text>
            <Text style={[styles.confirmMsg, { color: theme.subText }]}>
              This will permanently delete all messages for everyone in this
              group.
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={[
                  styles.confirmCancel,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.inputBg,
                  },
                ]}
                onPress={() => setShowClearConfirm(false)}
              >
                <Text
                  style={[styles.confirmCancelText, { color: theme.subText }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDelete}
                onPress={clearChat}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.confirmDeleteText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  centerText: { fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  listEmpty: { flex: 1, justifyContent: "center" },
  emptyBox: { alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "bold" },
  emptyDesc: { fontSize: 14 },

  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 14,
  },
  dateLine: { flex: 1, height: 1 },
  dateText: { fontWeight: "600" },

  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  rowMe: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },

  avatarBox: { width: 34, alignItems: "center", justifyContent: "flex-end" },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  avatarSpacer: { width: 32 },

  bubbleWrap: { maxWidth: "75%", gap: 2 },
  bubbleWrapMe: { alignItems: "flex-end" },
  bubbleWrapOther: { alignItems: "flex-start" },

  senderName: { fontWeight: "700", marginBottom: 3, paddingLeft: 14 },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 3,
  },
  msgText: { lineHeight: 20 },
  msgTime: { fontSize: 10, alignSelf: "flex-end", marginTop: 2 },

  // Reply preview inside bubble
  replyPreview: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 6,
    borderRadius: 4,
  },
  replyPreviewSender: { fontWeight: "700", marginBottom: 2 },
  replyPreviewText: {},

  // Reply banner above input
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderLeftWidth: 3,
  },
  replyBannerSender: { fontWeight: "700", marginBottom: 2 },
  replyBannerText: {},

  inputBar: { borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  inputInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  input: { flex: 1, maxHeight: 100, lineHeight: 20, paddingTop: 2 },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },

  // Message Menu Modal
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  menuPreview: {
    padding: 16,
    borderBottomWidth: 1,
  },
  menuPreviewSender: { fontWeight: "700", marginBottom: 4 },
  menuPreviewText: {},
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: { fontWeight: "500" },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  cancelBtnText: {},

  // Clear Confirm
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBox: {
    borderRadius: 20,
    padding: 28,
    width: 300,
    alignItems: "center",
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  confirmTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  confirmMsg: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmBtns: { flexDirection: "row", gap: 12, width: "100%" },
  confirmCancel: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  confirmCancelText: { fontSize: 14, fontWeight: "600" },
  confirmDelete: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#FF6B6B",
  },
  confirmDeleteText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
