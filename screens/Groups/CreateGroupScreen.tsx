import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useResponsive } from "../../components/useResponsive";
import WithDrawer from "../../components/withDrawer";

const CATEGORIES = [
  { id: "study", label: "Study", icon: "📚" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "tech", label: "Tech", icon: "💻" },
  { id: "arts", label: "Arts", icon: "🎨" },
  { id: "dance", label: "Dance", icon: "💃" },
  { id: "business", label: "Business", icon: "🚀" },
  { id: "health", label: "Health", icon: "🏥" },
  { id: "social", label: "Social", icon: "🌍" },
];

const COLORS = [
  "#4C9BE8",
  "#51CF66",
  "#845EF7",
  "#FF6B6B",
  "#FF6B9D",
  "#FFB347",
  "#20C997",
  "#FD7E14",
];

export default function CreateGroupScreen({ navigation }: any) {
  const { theme, fontSizes } = useTheme();
  const { padding } = useResponsive();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("#4C9BE8");
  const [location, setLocation] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingFrequency, setMeetingFrequency] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleCreate = async () => {
    setError("");
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (!category) {
      setError("Please select a category");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/groups", {
        name: name.trim(),
        description: description.trim(),
        category,
        color,
        location: location.trim() || null,
        meeting_time: meetingTime.trim() || null,
        meeting_frequency: meetingFrequency.trim() || null,
        max_members: maxMembers ? parseInt(maxMembers) : null,
        is_private: isPrivate,
        require_approval: requireApproval,
        tags,
      });
      if (res.data.success) {
        setSuccess(
          "Group submitted for admin approval! You will be notified once it is approved.",
        );
        setTimeout(() => navigation.navigate("MyGroups"), 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithDrawer
      navigation={navigation}
      activeScreen=""
      title="Create Group"
      showBack
    >
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.bg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: padding }]}>
          <Text
            style={[
              styles.title,
              { color: theme.text, fontSize: fontSizes.xxl },
            ]}
          >
            Create a Group
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            Build your campus community
          </Text>
        </View>

        <View style={[styles.content, { paddingHorizontal: padding }]}>
          {/* Error / Success */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {!!success && (
            <View style={styles.successBox}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#51CF66"
              />
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          {/* Basic Info Card */}
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
              Basic Information
            </Text>

            <View style={styles.fieldGroup}>
              <Text
                style={[
                  styles.label,
                  { color: theme.subText, fontSize: fontSizes.xs },
                ]}
              >
                Group Name *
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: theme.inputBg, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={theme.subText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, fontSize: fontSizes.sm },
                  ]}
                  placeholder="Enter group name"
                  placeholderTextColor={theme.subText}
                  value={name}
                  onChangeText={setName}
                  maxLength={100}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text
                style={[
                  styles.label,
                  { color: theme.subText, fontSize: fontSizes.xs },
                ]}
              >
                Description *
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    height: 100,
                    alignItems: "flex-start",
                    paddingVertical: 12,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      fontSize: fontSizes.sm,
                      height: 80,
                      textAlignVertical: "top",
                    },
                  ]}
                  placeholder="What is this group about?"
                  placeholderTextColor={theme.subText}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={500}
                />
              </View>
              <Text
                style={[
                  styles.charCount,
                  { color: theme.subText, fontSize: fontSizes.xs },
                ]}
              >
                {description.length}/500
              </Text>
            </View>
          </View>

          {/* Category Card */}
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
              Category *
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.inputBg,
                    },
                    category === cat.id && {
                      borderColor: color,
                      backgroundColor: color + "20",
                    },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: category === cat.id ? color : theme.subText,
                        fontSize: fontSizes.xs,
                      },
                      category === cat.id && { fontWeight: "700" },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {category === cat.id && (
                    <Ionicons name="checkmark-circle" size={14} color={color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Card */}
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
              Group Color
            </Text>
            <Text
              style={[
                styles.cardSub,
                { color: theme.subText, fontSize: fontSizes.xs },
              ]}
            >
              Choose a color that represents your group
            </Text>
            <View style={styles.colorsRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    color === c && styles.colorDotSelected,
                  ]}
                  onPress={() => setColor(c)}
                >
                  {color === c && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Details Card */}
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
              Meeting Details
            </Text>

            {[
              {
                label: "Location",
                value: location,
                setter: setLocation,
                icon: "location-outline",
                placeholder: "e.g. Great Hall, Balme Library",
              },
              {
                label: "Meeting Time",
                value: meetingTime,
                setter: setMeetingTime,
                icon: "time-outline",
                placeholder: "e.g. Fridays 4PM",
              },
              {
                label: "Frequency",
                value: meetingFrequency,
                setter: setMeetingFrequency,
                icon: "repeat-outline",
                placeholder: "e.g. Weekly, Bi-weekly",
              },
              {
                label: "Max Members",
                value: maxMembers,
                setter: setMaxMembers,
                icon: "people-outline",
                placeholder: "Leave empty for unlimited",
                keyboardType: "numeric" as const,
              },
            ].map((f, i) => (
              <View key={i} style={styles.fieldGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  {f.label}
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={16}
                    color={theme.subText}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.text, fontSize: fontSizes.sm },
                    ]}
                    placeholder={f.placeholder}
                    placeholderTextColor={theme.subText}
                    value={f.value}
                    onChangeText={f.setter}
                    keyboardType={f.keyboardType || "default"}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Tags Card */}
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
              Tags
            </Text>
            <Text
              style={[
                styles.cardSub,
                { color: theme.subText, fontSize: fontSizes.xs },
              ]}
            >
              Add up to 5 tags to help people find your group
            </Text>

            <View style={styles.tagInputRow}>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    flex: 1,
                  },
                ]}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={16}
                  color={theme.subText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, fontSize: fontSizes.sm },
                  ]}
                  placeholder="Add a tag..."
                  placeholderTextColor={theme.subText}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity
                style={[styles.addTagBtn, tags.length >= 5 && { opacity: 0.5 }]}
                onPress={addTag}
                disabled={tags.length >= 5}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {tags.length > 0 && (
              <View style={styles.tagsRow}>
                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tag,
                      { backgroundColor: color + "20", borderColor: color },
                    ]}
                    onPress={() => removeTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color, fontSize: fontSizes.xs },
                      ]}
                    >
                      #{tag}
                    </Text>
                    <Ionicons name="close" size={12} color={color} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Privacy Card */}
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
              Privacy & Access
            </Text>

            {[
              {
                icon: "lock-closed-outline",
                color: "#845EF7",
                title: "Private Group",
                desc: "Only invited members can see this group",
                value: isPrivate,
                setter: setIsPrivate,
              },
              {
                icon: "checkmark-circle-outline",
                color: "#51CF66",
                title: "Require Approval",
                desc: "New members must be approved by admin",
                value: requireApproval,
                setter: setRequireApproval,
              },
            ].map((item, i, arr) => (
              <View
                key={i}
                style={[
                  styles.switchRow,
                  { borderBottomColor: theme.border },
                  i < arr.length - 1 && { borderBottomWidth: 1 },
                ]}
              >
                <View
                  style={[
                    styles.switchIcon,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={item.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.switchTitle,
                      { color: theme.text, fontSize: fontSizes.sm },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.switchDesc,
                      { color: theme.subText, fontSize: fontSizes.xs },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.setter}
                  trackColor={{ false: theme.border, true: color }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: color },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Create Group</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </WithDrawer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontWeight: "bold", marginBottom: 4 },
  subtitle: {},
  content: { gap: 16 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  errorText: { color: "#FF6B6B", fontSize: 13, flex: 1 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FFF4",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#C3F0CA",
  },
  successText: { color: "#2E7D32", fontSize: 13, flex: 1 },

  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 12,
    elevation: 1,
  },
  cardTitle: { fontWeight: "bold" },
  cardSub: {},

  fieldGroup: { gap: 6 },
  label: { fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1 },
  charCount: { textAlign: "right" },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontWeight: "500" },

  colorsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotSelected: { borderWidth: 3, borderColor: "#fff", elevation: 4 },

  tagInputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  addTagBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#00467F",
    alignItems: "center",
    justifyContent: "center",
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: { fontWeight: "600" },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  switchTitle: { fontWeight: "600", marginBottom: 2 },
  switchDesc: { lineHeight: 16 },

  submitBtn: {
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 4,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
