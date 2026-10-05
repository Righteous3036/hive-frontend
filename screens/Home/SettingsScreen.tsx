import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";
import { useResponsive } from "../../components/useResponsive";
import WithDrawer from "../../components/withDrawer";

const PRESET_WALLPAPERS = [
  {
    id: "quad",
    name: "Campus Quad",
    uri: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "midnight",
    name: "Cosmic Sky",
    uri: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "warm",
    name: "Golden Hour",
    uri: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "geometry",
    name: "Cyber Flow",
    uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function SettingsScreen({ navigation }: any) {
  const { user } = useUser();
  const {
    isDarkMode,
    fontSize,
    backgroundImage,
    toggleDarkMode,
    setFontSize,
    setBackgroundImage,
    removeBackgroundImage,
    theme,
    fontSizes,
  } = useTheme();
  const { padding } = useResponsive();
  const [isPickingImage, setIsPickingImage] = useState(false);

  const handlePickImage = async () => {
    try {
      setIsPickingImage(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to choose a custom background image."
        );
        setIsPickingImage(false);
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        const imgUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        await setBackgroundImage(imgUri);
      }
    } catch (err) {
      console.error("Error picking wallpaper image:", err);
      Alert.alert("Error", "Could not load the chosen image. Please try again.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleRemoveBackground = async () => {
    await removeBackgroundImage();
  };

  return (
    <WithDrawer
      navigation={navigation}
      activeScreen="Settings"
      title="Settings"
    >
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.bg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: padding }]}>
          <Text
            style={[
              styles.title,
              { color: theme.text, fontSize: fontSizes.xxl },
            ]}
          >
            Settings
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            Customize your experience
          </Text>
        </View>

        <View style={[styles.content, { paddingHorizontal: padding }]}>
          {/* Appearance Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.cardIconBox, { backgroundColor: "#845EF720" }]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color="#845EF7"
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  Appearance
                </Text>
                <Text
                  style={[
                    styles.cardSub,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  Customize how the app looks
                </Text>
              </View>
            </View>

            {/* Dark Mode */}
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.rowIcon,
                    {
                      backgroundColor: isDarkMode ? "#845EF720" : "#FFB34720",
                    },
                  ]}
                >
                  <Ionicons
                    name={isDarkMode ? "moon" : "sunny"}
                    size={18}
                    color={isDarkMode ? "#845EF7" : "#FFB347"}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: theme.text, fontSize: fontSizes.md },
                    ]}
                  >
                    {isDarkMode ? "Dark Mode" : "Light Mode"}
                  </Text>
                  <Text
                    style={[
                      styles.rowSub,
                      { color: theme.subText, fontSize: fontSizes.xs },
                    ]}
                  >
                    {isDarkMode ? "Using dark theme" : "Using light theme"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#E8ECF4", true: "#845EF7" }}
                thumbColor="#fff"
              />
            </View>

            {/* Theme Preview */}
            <View style={styles.themeRow}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { borderColor: !isDarkMode ? "#00467F" : theme.border },
                  { borderWidth: !isDarkMode ? 2 : 1 },
                ]}
                onPress={() => toggleDarkMode(false)}
              >
                <View style={styles.lightPreview}>
                  <View style={styles.lightBar} />
                  <View style={styles.lightBody}>
                    <View style={styles.lightLine} />
                    <View style={[styles.lightLine, { width: "60%" }]} />
                  </View>
                </View>
                <View style={styles.themeLabel}>
                  {!isDarkMode && (
                    <Ionicons
                      name="checkmark-circle"
                      size={13}
                      color="#00467F"
                    />
                  )}
                  <Text
                    style={[
                      styles.themeLabelText,
                      { color: theme.text, fontSize: fontSizes.xs },
                    ]}
                  >
                    Light
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { borderColor: isDarkMode ? "#845EF7" : theme.border },
                  { borderWidth: isDarkMode ? 2 : 1 },
                ]}
                onPress={() => toggleDarkMode(true)}
              >
                <View style={styles.darkPreview}>
                  <View style={styles.darkBar} />
                  <View style={styles.darkBody}>
                    <View style={styles.darkLine} />
                    <View style={[styles.darkLine, { width: "60%" }]} />
                  </View>
                </View>
                <View style={styles.themeLabel}>
                  {isDarkMode && (
                    <Ionicons
                      name="checkmark-circle"
                      size={13}
                      color="#845EF7"
                    />
                  )}
                  <Text
                    style={[
                      styles.themeLabelText,
                      { color: theme.text, fontSize: fontSizes.xs },
                    ]}
                  >
                    Dark
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Font Size */}
            <View
              style={[
                styles.row,
                { borderBottomColor: theme.border, borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[styles.rowIcon, { backgroundColor: "#4C9BE820" }]}
                >
                  <Ionicons name="text-outline" size={18} color="#4C9BE8" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: theme.text, fontSize: fontSizes.md },
                    ]}
                  >
                    Font Size
                  </Text>
                  <Text
                    style={[
                      styles.rowSub,
                      { color: theme.subText, fontSize: fontSizes.xs },
                    ]}
                  >
                    Currently: {fontSize}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.fontRow}>
              {(["Small", "Medium", "Large"] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontOption,
                    {
                      borderColor: fontSize === size ? "#00467F" : theme.border,
                      backgroundColor:
                        fontSize === size ? "#EFF4FF" : theme.inputBg,
                    },
                  ]}
                  onPress={() => setFontSize(size)}
                >
                  <Text
                    style={[
                      styles.fontAa,
                      { color: fontSize === size ? "#00467F" : theme.subText },
                      size === "Small" && { fontSize: 12 },
                      size === "Medium" && { fontSize: 16 },
                      size === "Large" && { fontSize: 20 },
                    ]}
                  >
                    Aa
                  </Text>
                  <Text
                    style={[
                      styles.fontLabel,
                      {
                        color: fontSize === size ? "#00467F" : theme.subText,
                        fontSize: fontSizes.xs,
                      },
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme & Wallpaper Customization Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.cardIconBox, { backgroundColor: "#FF6B6B20" }]}
              >
                <Ionicons
                  name="image-outline"
                  size={20}
                  color="#FF6B6B"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  Theme & Wallpaper
                </Text>
                <Text
                  style={[
                    styles.cardSub,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  App-wide background image customization
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: backgroundImage
                      ? "rgba(16, 185, 129, 0.15)"
                      : theme.inputBg,
                    borderColor: backgroundImage
                      ? "#10B981"
                      : theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: backgroundImage ? "#10B981" : theme.subText },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: backgroundImage ? "#10B981" : theme.subText,
                      fontSize: fontSizes.xs - 2,
                    },
                  ]}
                >
                  {backgroundImage ? "Active" : "Default"}
                </Text>
              </View>
            </View>

            {/* Current Active Preview Banner */}
            {backgroundImage ? (
              <View
                style={[
                  styles.activePreviewCard,
                  { borderColor: theme.border },
                ]}
              >
                <ImageBackground
                  source={{ uri: backgroundImage }}
                  style={styles.activePreviewImage}
                  imageStyle={{ borderRadius: 12 }}
                >
                  <View style={styles.activePreviewOverlay}>
                    <View style={styles.activePreviewInfo}>
                      <Ionicons name="sparkles" size={15} color="#F59E0B" />
                      <Text style={styles.activePreviewTitle}>
                        Custom Background Applied
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.activePreviewClearBtn}
                      onPress={handleRemoveBackground}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={13} color="#FFFFFF" />
                      <Text style={styles.activePreviewClearText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </View>
            ) : (
              <View
                style={[
                  styles.solidInfoBox,
                  { backgroundColor: theme.inputBg, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name="color-filter-outline"
                  size={18}
                  color={theme.subText}
                />
                <Text
                  style={[
                    styles.solidInfoText,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  Default solid {isDarkMode ? "dark" : "light"} background is currently active across the app.
                </Text>
              </View>
            )}

            {/* Action Cards: None & Gallery Upload */}
            <View style={styles.actionCardsRow}>
              {/* Option 1: None (Default Theme) */}
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: !backgroundImage ? "#845EF7" : theme.border,
                    borderWidth: !backgroundImage ? 2 : 1,
                  },
                ]}
                onPress={handleRemoveBackground}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.nonePreviewIconBox,
                    { backgroundColor: isDarkMode ? "#0B0F19" : "#F8FAFC" },
                  ]}
                >
                  <Ionicons
                    name="ban-outline"
                    size={22}
                    color={!backgroundImage ? "#845EF7" : theme.subText}
                  />
                </View>
                <View style={styles.actionCardLabelRow}>
                  {!backgroundImage && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#845EF7"
                    />
                  )}
                  <Text
                    style={[
                      styles.actionCardTitle,
                      {
                        color: !backgroundImage ? "#845EF7" : theme.text,
                        fontSize: fontSizes.xs + 1,
                      },
                    ]}
                  >
                    None
                  </Text>
                </View>
                <Text
                  style={[
                    styles.actionCardSub,
                    { color: theme.subText, fontSize: fontSizes.xs - 2 },
                  ]}
                >
                  Default solid theme
                </Text>
              </TouchableOpacity>

              {/* Option 2: Upload From Device Gallery */}
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor:
                      backgroundImage &&
                      !PRESET_WALLPAPERS.some((p) => p.uri === backgroundImage)
                        ? "#10B981"
                        : theme.border,
                    borderWidth:
                      backgroundImage &&
                      !PRESET_WALLPAPERS.some((p) => p.uri === backgroundImage)
                        ? 2
                        : 1,
                  },
                ]}
                onPress={handlePickImage}
                disabled={isPickingImage}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.nonePreviewIconBox,
                    { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                  ]}
                >
                  {isPickingImage ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : (
                    <Ionicons
                      name="images-outline"
                      size={22}
                      color="#10B981"
                    />
                  )}
                </View>
                <View style={styles.actionCardLabelRow}>
                  {backgroundImage &&
                    !PRESET_WALLPAPERS.some((p) => p.uri === backgroundImage) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#10B981"
                      />
                    )}
                  <Text
                    style={[
                      styles.actionCardTitle,
                      {
                        color:
                          backgroundImage &&
                          !PRESET_WALLPAPERS.some((p) => p.uri === backgroundImage)
                            ? "#10B981"
                            : theme.text,
                        fontSize: fontSizes.xs + 1,
                      },
                    ]}
                  >
                    Device Gallery
                  </Text>
                </View>
                <Text
                  style={[
                    styles.actionCardSub,
                    { color: theme.subText, fontSize: fontSizes.xs - 2 },
                  ]}
                >
                  Pick from photos
                </Text>
              </TouchableOpacity>
            </View>

            {/* Curated Presets Header */}
            <View style={styles.presetsHeader}>
              <Text
                style={[
                  styles.presetsSectionTitle,
                  { color: theme.text, fontSize: fontSizes.sm },
                ]}
              >
                Curated Wallpapers
              </Text>
              <Text
                style={[
                  styles.presetsSectionSub,
                  { color: theme.subText, fontSize: fontSizes.xs },
                ]}
              >
                Tap to apply
              </Text>
            </View>

            {/* Presets Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsScroll}
            >
              {PRESET_WALLPAPERS.map((preset) => {
                const isSelected = backgroundImage === preset.uri;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.presetCard,
                      {
                        borderColor: isSelected ? "#845EF7" : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setBackgroundImage(preset.uri)}
                    activeOpacity={0.8}
                  >
                    <ImageBackground
                      source={{ uri: preset.uri }}
                      style={styles.presetImage}
                      imageStyle={{ borderRadius: 10 }}
                    >
                      <View style={styles.presetOverlay}>
                        {isSelected && (
                          <View style={styles.presetCheckBadge}>
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                        <Text style={styles.presetName} numberOfLines={1}>
                          {preset.name}
                        </Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Explicit Remove / Revert Button */}
            {backgroundImage && (
              <TouchableOpacity
                style={[
                  styles.removeFullBtn,
                  {
                    borderColor: "rgba(239, 68, 68, 0.35)",
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                  },
                ]}
                onPress={handleRemoveBackground}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.removeFullBtnText}>
                  Remove Custom Background (Revert to Default)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Admin Management Card */}
          {user?.role === "admin" && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: (theme.accent || "#F5A623") + "40",
                  borderWidth: 1.5,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconBox,
                    { backgroundColor: (theme.accent || "#F5A623") + "20" },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={theme.accent || "#F5A623"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: theme.text, fontSize: fontSizes.lg },
                    ]}
                  >
                    Administration
                  </Text>
                  <Text
                    style={[
                      styles.cardSub,
                      { color: theme.subText, fontSize: fontSizes.xs },
                    ]}
                  >
                    Campus moderation & user controls
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: theme.accent || "#F5A623",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: "800",
                    }}
                  >
                    ADMIN
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: (theme.accent || "#F5A623") + "15",
                  padding: 14,
                  borderRadius: 12,
                  marginTop: 4,
                }}
                onPress={() => navigation.navigate("AdminDashboard")}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons
                    name="grid-outline"
                    size={18}
                    color={theme.accent || "#F5A623"}
                  />
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: fontSizes.sm,
                      fontWeight: "700",
                    }}
                  >
                    Open Admin Dashboard
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.accent || "#F5A623"}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* About Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.cardIconBox, { backgroundColor: "#20C99720" }]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#20C997"
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  About
                </Text>
                <Text
                  style={[
                    styles.cardSub,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  App information
                </Text>
              </View>
            </View>

            {[
              { label: "App Name", value: "Hive" },
              { label: "App Version", value: "1.0.0" },
              { label: "Developer", value: "RIGHTEOUS" },
              { label: "University", value: "University of Ghana" },
              { label: "Department", value: "Computer Science" },
            ].map((item, i, arr) => (
              <View
                key={i}
                style={[
                  styles.aboutRow,
                  { borderBottomColor: theme.border },
                  i < arr.length - 1 && { borderBottomWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.aboutLabel,
                    { color: theme.subText, fontSize: fontSizes.sm },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.aboutValue,
                    { color: theme.text, fontSize: fontSizes.sm },
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
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

  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontWeight: "bold" },
  cardSub: { marginTop: 2 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontWeight: "600", marginBottom: 2 },
  rowSub: {},

  themeRow: { flexDirection: "row", gap: 12, paddingVertical: 12 },
  themeOption: { flex: 1, borderRadius: 12, overflow: "hidden" },
  lightPreview: { backgroundColor: "#F5F7FF", height: 60 },
  lightBar: { height: 14, backgroundColor: "#00467F" },
  lightBody: { padding: 8, gap: 5 },
  lightLine: {
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    width: "80%",
  },
  darkPreview: { backgroundColor: "#1a1a2e", height: 60 },
  darkBar: { height: 14, backgroundColor: "#0f3460" },
  darkBody: { padding: 8, gap: 5 },
  darkLine: {
    height: 5,
    backgroundColor: "#2a2a4a",
    borderRadius: 2,
    width: "80%",
  },
  themeLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
  },
  themeLabelText: { fontWeight: "600" },

  fontRow: { flexDirection: "row", gap: 10, paddingVertical: 12 },
  fontOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
  },
  fontAa: { fontWeight: "bold" },
  fontLabel: { fontWeight: "500" },

  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  aboutLabel: {},
  aboutValue: { fontWeight: "600" },

  // Theme & Wallpaper section styles
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontWeight: "700",
  },
  activePreviewCard: {
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 14,
  },
  activePreviewImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  activePreviewOverlay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  activePreviewInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activePreviewTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  activePreviewClearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239, 68, 68, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activePreviewClearText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  solidInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  solidInfoText: {
    flex: 1,
    lineHeight: 17,
  },
  actionCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nonePreviewIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCardTitle: {
    fontWeight: "700",
    textAlign: "center",
  },
  actionCardSub: {
    textAlign: "center",
  },
  presetsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  presetsSectionTitle: {
    fontWeight: "700",
  },
  presetsSectionSub: {
    fontWeight: "500",
  },
  presetsScroll: {
    gap: 10,
    paddingBottom: 6,
  },
  presetCard: {
    width: 120,
    height: 78,
    borderRadius: 12,
    overflow: "hidden",
  },
  presetImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  presetOverlay: {
    padding: 6,
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  presetCheckBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#845EF7",
    alignItems: "center",
    justifyContent: "center",
  },
  presetName: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    flex: 1,
  },
  removeFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  removeFullBtnText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
