import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../components/ThemeContext";
import { useResponsive } from "../../components/useResponsive";
import WithDrawer from "../../components/withDrawer";

export default function SettingsScreen({ navigation }: any) {
  const {
    isDarkMode,
    fontSize,
    toggleDarkMode,
    setFontSize,
    theme,
    fontSizes,
  } = useTheme();
  const { padding } = useResponsive();

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
});
