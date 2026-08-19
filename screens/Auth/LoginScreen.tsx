import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
        setToken(res.data.token);
        setUser({
          ...res.data.user,
          profile_picture: null,
          cover_photo: null,
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
              profile_color: u.profile_color || "#00467F",
              profile_picture: u.profile_picture || null,
              cover_photo: u.cover_photo || null,
            });
          }
        } catch (e) {}

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
    <View style={[styles.formBox, { backgroundColor: theme.card }]}>
      <Text
        style={[
          styles.formTitle,
          { color: theme.text, fontSize: fontSizes.xxl },
        ]}
      >
        Welcome Back 👋
      </Text>
      <Text
        style={[
          styles.formSub,
          { color: theme.subText, fontSize: fontSizes.sm },
        ]}
      >
        Sign in to your account to continue
      </Text>

      {error.length > 0 && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Role Selector */}
      <View style={styles.fieldGroup}>
        <Text
          style={[
            styles.label,
            { color: theme.subText, fontSize: fontSizes.xs },
          ]}
        >
          I am signing in as a
        </Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              { borderColor: theme.border, backgroundColor: theme.inputBg },
              role === "student" && styles.roleBtnActive,
            ]}
            onPress={() => setRole("student")}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={role === "student" ? "#fff" : theme.subText}
            />
            <Text
              style={[
                styles.roleBtnText,
                { color: role === "student" ? "#fff" : theme.subText },
              ]}
            >
              Student
            </Text>
            {role === "student" && (
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleBtn,
              { borderColor: theme.border, backgroundColor: theme.inputBg },
              role === "admin" && styles.roleBtnAdminActive,
            ]}
            onPress={() => setRole("admin")}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={role === "admin" ? "#fff" : theme.subText}
            />
            <Text
              style={[
                styles.roleBtnText,
                { color: role === "admin" ? "#fff" : theme.subText },
              ]}
            >
              Admin
            </Text>
            {role === "admin" && (
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={[styles.label, { color: theme.subText, fontSize: fontSizes.xs }]}
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
          color={theme.subText}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.text, fontSize: fontSizes.md }]}
          placeholder="Enter your university email"
          placeholderTextColor={theme.subText}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <Text
        style={[styles.label, { color: theme.subText, fontSize: fontSizes.xs }]}
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
          color={theme.subText}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.text, fontSize: fontSizes.md }]}
          placeholder="Enter your password"
          placeholderTextColor={theme.subText}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={18}
            color={theme.subText}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.forgotRow}>
        <Text style={[styles.forgotText, { fontSize: fontSizes.xs }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginBtn, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
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
            { color: theme.subText, fontSize: fontSizes.sm },
          ]}
        >
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={[styles.registerLink, { fontSize: fontSizes.sm }]}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.footer,
          { color: theme.subText, fontSize: fontSizes.xs },
        ]}
      >
        Hive • University of Ghana
      </Text>
    </View>
  );

  // ── MOBILE ──
  if (isMobile) {
    return (
      <SafeAreaView style={[styles.mobileSafe, { backgroundColor: "#00467F" }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.mobileScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Hero */}
            <View style={styles.mobileHero}>
              <View style={styles.circle1} />
              <View style={styles.circle2} />
              <Text style={styles.mobileEmoji}>🎓</Text>
              <Text style={styles.mobileAppName}>Hive 🐝</Text>
              <Text style={styles.mobileTagline}>
                Connect. Collaborate. Belong.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.mobileFormWrap}>{form}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── WEB ──
  return (
    <View style={[styles.webRoot, { backgroundColor: "#F5F7FF" }]}>
      {/* Left Panel */}
      <View style={styles.webLeft}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Text style={styles.webEmoji}>🎓</Text>
        <Text style={styles.webAppName}>Hive 🐝</Text>
        <Text style={styles.webTagline}>Connect. Collaborate. Belong.</Text>
        {[
          { icon: "people-outline", text: "Discover student groups" },
          { icon: "search-outline", text: "Search by interest or category" },
          { icon: "chatbubble-outline", text: "Connect with your community" },
          { icon: "star-outline", text: "Join and manage groups easily" },
        ].map((f, i) => (
          <View key={i} style={styles.webFeatureItem}>
            <Ionicons
              name={f.icon as any}
              size={18}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.webFeatureText}>{f.text}</Text>
          </View>
        ))}
        <Text style={styles.webLeftFooter}>Hive • University of Ghana</Text>
      </View>

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
  // ── MOBILE ──
  mobileSafe: { flex: 1 },
  mobileScroll: { flexGrow: 1 },
  mobileHero: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
    overflow: "hidden",
  },
  mobileFormWrap: { flex: 1 },
  mobileEmoji: { fontSize: 60, marginBottom: 12, zIndex: 1 },
  mobileAppName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    zIndex: 1,
  },
  mobileTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.78)",
    zIndex: 1,
  },

  // ── WEB ──
  webRoot: { flexDirection: "row", flex: 1 },
  webLeft: {
    width: 420,
    backgroundColor: "#00467F",
    padding: 48,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  webEmoji: { fontSize: 56, marginBottom: 12 },
  webAppName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
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
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },

  // ── CIRCLES (shared) ──
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -100,
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

  // ── FORM (shared) ──
  formBox: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
  },
  formTitle: { fontWeight: "bold", marginBottom: 6 },
  formSub: { marginBottom: 24 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  errorText: { color: "#FF6B6B", fontSize: 13, flex: 1 },
  label: { fontWeight: "600", marginBottom: 8 },
  fieldGroup: { marginBottom: 18 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1 },
  forgotRow: { alignSelf: "flex-end", marginTop: -8, marginBottom: 24 },
  forgotText: { color: "#00467F", fontWeight: "600" },
  loginBtn: {
    backgroundColor: "#00467F",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginBtnText: { color: "#fff", fontWeight: "bold" },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  registerText: {},
  registerLink: { color: "#00467F", fontWeight: "bold" },
  footer: { textAlign: "center" },
  roleRow: { flexDirection: "row", gap: 12 },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
  },
  roleBtnActive: { backgroundColor: "#00467F", borderColor: "#00467F" },
  roleBtnAdminActive: { backgroundColor: "#845EF7", borderColor: "#845EF7" },
  roleBtnText: { fontSize: 14, fontWeight: "600" },
});
