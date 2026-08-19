import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function SavedScreen({ navigation }: any) {
  const { theme, fontSizes } = useTheme();
  const { isMobile, padding } = useResponsive();
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSaved();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSaved();
    setRefreshing(false);
  };

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/saved");
      if (res.data.success) setGroups(res.data.groups);
    } catch (err) {
      console.log("Saved error:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (groupId: number) => {
    try {
      await api.post(`/users/saved/${groupId}`);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch {}
  };

  const getIcon = (g: any) => CAT_ICONS[g.category] || "📌";
  const getColor = (g: any) => g.color || CAT_COLORS[g.category] || "#4C9BE8";

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <WithDrawer
      navigation={navigation}
      activeScreen="Saved"
      title="Saved Groups"
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
          <Text
            style={[
              styles.title,
              { color: theme.text, fontSize: fontSizes.xxl },
            ]}
          >
            Saved Groups
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            {groups.length > 0
              ? `${groups.length} saved group${groups.length > 1 ? "s" : ""}`
              : "No saved groups yet"}
          </Text>
        </View>

        {/* Search */}
        {groups.length > 0 && (
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
              placeholder="Search saved groups..."
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
        )}

        {/* List */}
        <View style={[styles.list, { paddingHorizontal: padding }]}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#00467F" />
              <Text style={[styles.centerText, { color: theme.subText }]}>
                Loading saved groups...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>{search ? "🔍" : "🔖"}</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {search ? "No results" : "No saved groups"}
              </Text>
              <Text style={[styles.centerText, { color: theme.subText }]}>
                {search
                  ? "Try different keywords"
                  : "Save groups to find them easily later"}
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
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.cardIconBox,
                    { backgroundColor: getColor(group) + "20" },
                  ]}
                >
                  <Text style={styles.cardEmoji}>{getIcon(group)}</Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text
                    style={[
                      styles.cardName,
                      { color: theme.text, fontSize: fontSizes.md },
                    ]}
                    numberOfLines={1}
                  >
                    {group.name}
                  </Text>
                  <Text
                    style={[
                      styles.cardCat,
                      { color: theme.subText, fontSize: fontSizes.xs },
                    ]}
                  >
                    {group.category}
                  </Text>
                  {group.meeting_time && (
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
                  )}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.unsaveBtn}
                    onPress={() => removeSaved(group.id)}
                  >
                    <Ionicons name="bookmark" size={20} color="#00467F" />
                  </TouchableOpacity>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.subText}
                  />
                </View>
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
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontWeight: "bold", marginBottom: 4 },
  subtitle: {},
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
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
    borderWidth: 1,
    elevation: 2,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: { fontSize: 26 },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { fontWeight: "bold" },
  cardCat: { textTransform: "capitalize" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: {},
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  unsaveBtn: { padding: 4 },
});
