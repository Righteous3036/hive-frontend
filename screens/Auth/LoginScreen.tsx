import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api, { setToken } from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";
import { useResponsive } from "../../components/useResponsive";
import { Palette, Radii, Shadows, Spacing } from "../../constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AUTH_BG_IMAGE = require("../../assets/images/welcome-bg.jpg");

export default function LoginScreen({ navigation }: any) {
  const { isMobile } = useResponsive();
  const { theme, fontSizes } = useTheme();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        const accountRole = res.data.user.role;
        if (role === "admin" && accountRole !== "admin") {
          setError("This account does not have admin access.");
          setLoading(false);
          return;
        }
        if (role === "student" && accountRole === "admin") {
          setError("Please select Admin to login with this account.");
          setLoading(false);
          return;
        }
        console.log("Login response keys:", Object.keys(res.data));
        console.log("Login token value:", res.data.token, "| accessToken:", res.data.accessToken);
        setToken(res.data.token);
        setUser({
          ...res.data.user,
          token: res.data.token,
          profile_picture: null,
          cover_photo: null,
          bio: "",
        });
        try {
          const profileRes = await api.get("/users/profile");
          if (profileRes.data.success) {
            const u = profileRes.data.user;
            setUser({
              id: u.id,
              name: u.name,
              email: u.email,
              student_id: u.student_id,
              department: u.department,
              level: u.level,
              role: u.role,
              bio: u.bio || "",
              profile_color: u.profile_color || Palette.primary,
              profile_picture: u.profile_picture || null,
              cover_photo: u.cover_photo || null,
              theme_background: u.theme_background || null,
              token: res.data.token,
            });
          }
        } catch (e) { }

        if (accountRole === "admin") {
          navigation.navigate("AdminDashboard");
        } else {
          navigation.navigate("Home");
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <View
      style={[
        styles.formBox,
        // Semi-transparent card background when over background image:
        isMobile
          ? { backgroundColor: styles.formBox.backgroundColor }
          : { backgroundColor: theme.card },
      ]}
    >
      <Text
        style={[
          styles.formTitle,
          { color: theme.text, fontSize: fontSizes.xxl },
        ]}
      >
        Welcome Back
      </Text>
      <Text
        style={[
          styles.formSub,
          { color: theme.textSecondary, fontSize: fontSizes.sm },
        ]}
      >
        Sign in to your account to continue
      </Text>

      {error.length > 0 && (
        <View style={[styles.errorBox, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => setError("")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={14} color={theme.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Role Selector — Segmented Control */}
      <View style={styles.fieldGroup}>
        <Text
          style={[
            styles.label,
            { color: theme.textSecondary, fontSize: fontSizes.xs },
          ]}
        >
          I am signing in as a
        </Text>
        <View style={[styles.roleRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              role === "student" && styles.roleBtnActive,
            ]}
            onPress={() => setRole("student")}
            accessibilityRole="tab"
            accessibilityState={{ selected: role === "student" }}
            accessibilityLabel="Sign in as student"
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={role === "student" ? "#fff" : theme.textSecondary}
            />
            <Text
              style={[
                styles.roleBtnText,
                { color: role === "student" ? "#fff" : theme.textSecondary },
              ]}
            >
              Student
            </Text>
            {role === "student" && (
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleBtn,
              role === "admin" && styles.roleBtnAdminActive,
            ]}
            onPress={() => setRole("admin")}
            accessibilityRole="tab"
            accessibilityState={{ selected: role === "admin" }}
            accessibilityLabel="Sign in as admin"
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={role === "admin" ? "#fff" : theme.textSecondary}
            />
            <Text
              style={[
                styles.roleBtnText,
                { color: role === "admin" ? "#fff" : theme.textSecondary },
              ]}
            >
              Admin
            </Text>
            {role === "admin" && (
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={[styles.label, { color: theme.textSecondary, fontSize: fontSizes.xs }]}
      >
        Email Address
      </Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name="mail-outline"
          size={18}
          color={theme.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.text, fontSize: fontSizes.md }]}
          placeholder="Enter your university email"
          placeholderTextColor={theme.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          accessibilityLabel="Email address input"
        />
      </View>

      <Text
        style={[styles.label, { color: theme.textSecondary, fontSize: fontSizes.xs }]}
      >
        Password
      </Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={theme.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.text, fontSize: fontSizes.md }]}
          placeholder="Enter your password"
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          accessibilityLabel="Password input"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          accessibilityRole="button"
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={18}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.forgotRow}
        onPress={() => navigation.navigate("ForgotPassword")}
        accessibilityRole="link"
        accessibilityLabel="Forgot password"
      >
        <Text style={[styles.forgotText, { fontSize: fontSizes.xs }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginBtn, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        accessibilityState={{ disabled: loading }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.loginBtnText, { fontSize: fontSizes.md }]}>
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.registerRow}>
        <Text
          style={[
            styles.registerText,
            { color: theme.textSecondary, fontSize: fontSizes.sm },
          ]}
        >
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          accessibilityRole="link"
          accessibilityLabel="Create a new account"
        >
          <Text style={[styles.registerLink, { fontSize: fontSizes.sm }]}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.footer,
          { color: theme.textTertiary, fontSize: fontSizes.xs },
        ]}
      >
        Hive • University of Ghana
      </Text>
    </View>
  );

  // ── MOBILE ──
  if (isMobile) {
    return (
      <ImageBackground
        source={AUTH_BG_IMAGE}
        style={styles.fullBgImage}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />
        <SafeAreaView style={styles.mobileSafe}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.mobileScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {navigation?.canGoBack?.() && (
                <View style={styles.authBackRow}>
                  <TouchableOpacity
                    style={styles.authBackBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
                    <Text style={styles.authBackBtnText}>Back</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Top Hero */}
              <View style={styles.mobileHero}>
                <View style={styles.mobileLogoBadge}>
                  <Ionicons name="school" size={40} color="#1E293B" />
                  <View style={styles.tasselDot} />
                </View>
                <Text style={styles.mobileAppName}>Hive</Text>
                <Text style={styles.mobileTagline}>
                  Where your interests meet your campus community
                </Text>
              </View>

              {/* Form */}
              <View style={styles.mobileFormWrap}>{form}</View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ── WEB ──
  return (
    <View style={[styles.webRoot, { backgroundColor: Palette.gray50 }]}>
      {/* Left Panel */}
      <ImageBackground
        source={AUTH_BG_IMAGE}
        style={styles.webLeft}
        resizeMode="cover"
      >
        <View style={styles.webLeftOverlay} />
        <View style={styles.webLeftContent}>
          <View style={styles.webLogoBadge}>
            <Ionicons name="school" size={36} color="#1E293B" />
            <View style={styles.tasselDot} />
          </View>
          <Text style={styles.webAppName}>Hive</Text>
          <Text style={styles.webTagline}>Where your interests meet your campus community</Text>
          {[
            { icon: "people-outline", text: "Discover student groups" },
            { icon: "search-outline", text: "Search by interest or category" },
            { icon: "chatbubble-outline", text: "Connect with your community" },
            { icon: "star-outline", text: "Join and manage groups easily" },
          ].map((f, i) => (
            <View key={i} style={styles.webFeatureItem}>
              <View style={styles.webFeatureIconBg}>
                <Ionicons
                  name={f.icon as any}
                  size={16}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
              <Text style={styles.webFeatureText}>{f.text}</Text>
            </View>
          ))}
          <Text style={styles.webLeftFooter}>Hive • University of Ghana</Text>
        </View>
      </ImageBackground>

      {/* Right Panel */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.webRightContent}
      >
        {form}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullBgImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  bgOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
  },
  webLeftOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10, 15, 29, 0.7)",
  },
  authBackRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  authBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  authBackBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  // ── MOBILE ──
  mobileSafe: { flex: 1 },
  mobileScroll: { flexGrow: 1 },
  mobileHero: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: Spacing.xl,
    position: "relative",
  },
  mobileFormWrap: { flex: 1 },
  mobileLogoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  tasselDot: {
    position: "absolute",
    bottom: 14,
    left: 18,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#F59E0B",
  },
  mobileEmoji: { fontSize: 40, zIndex: 1 },
  mobileAppName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    zIndex: 1,
    letterSpacing: 0.5,
  },
  mobileTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.78)",
    zIndex: 1,
  },

  // ── WEB ──
  webRoot: { flexDirection: "row", flex: 1 },
  webLeft: {
    width: 440,
    backgroundColor: Palette.primary,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  webLeftContent: {
    paddingHorizontal: 48,
    paddingVertical: 48,
    zIndex: 1,
  },
  webLogoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  webEmoji: { fontSize: 36 },
  webAppName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  webTagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 40,
  },
  webFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  webFeatureIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  webFeatureText: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  webLeftFooter: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    lineHeight: 20,
    marginTop: 40,
  },
  webRightContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 48,
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },

  // ── CIRCLES (shared) ──
  circle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -120,
    right: -80,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -60,
    left: -60,
  },
  circle3: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.03)",
    top: "40%",
    left: "20%",
  },

  // ── FORM (shared) ──
  formBox: {
    margin: Spacing.lg,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    // Semi-transparent container color with alpha channel so the background image shows through clearly:
    backgroundColor: "rgba(30, 41, 56, 0.75)", // RGBA color with alpha channel (e.g. rgba(30, 41, 56, 0.75) or rgba(15, 23, 42, 0.70))
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    ...Shadows.lg,
  },
  formTitle: { fontWeight: "800", marginBottom: 6, letterSpacing: -0.3 },
  formSub: { marginBottom: Spacing.xl },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, flex: 1 },
  label: { fontWeight: "600", marginBottom: Spacing.sm },
  fieldGroup: { marginBottom: 18 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: Spacing.lg,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1 },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: Spacing.xl,
    minHeight: 44,
    justifyContent: "center",
  },
  forgotText: { color: Palette.primary, fontWeight: "600" },
  loginBtn: {
    backgroundColor: Palette.primary,
    borderRadius: Radii.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...Shadows.primaryGlow,
  },
  loginBtnText: { color: "#fff", fontWeight: "700" },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  registerText: {},
  registerLink: { color: Palette.primary, fontWeight: "700" },
  footer: { textAlign: "center" },
  roleRow: {
    flexDirection: "row",
    gap: 0,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    padding: 4,
    overflow: "hidden",
  },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: Radii.sm,
    paddingVertical: 12,
    minHeight: 44,
  },
  roleBtnActive: { backgroundColor: Palette.primary },
  roleBtnAdminActive: { backgroundColor: Palette.accent },
  roleBtnText: { fontSize: 14, fontWeight: "600" },
});
