import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
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
import api from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useResponsive } from "../../components/useResponsive";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AUTH_BG_IMAGE = require("../../assets/images/welcome-bg.jpg");

export default function ForgotPasswordScreen({ navigation }: any) {
  const { theme, fontSizes } = useTheme();
  const { isMobile } = useResponsive();

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const timerRef = useRef<any>(null);
  const otpRefs = useRef<any[]>([]);

  const startTimer = () => {
    setTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.success) {
        setStep("otp");
        startTimer();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Email not found. Please check and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/verify-reset-otp", {
        email,
        otp: otpCode,
      });
      if (res.data.success) {
        setStep("reset");
        setError("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const otpCode = otp.join("");
      const res = await api.post("/auth/reset-password", {
        email,
        otp: otpCode,
        newPassword,
      });
      if (res.data.success) {
        setSuccess("Password reset successfully! You can now login.");
        setTimeout(() => navigation.navigate("Login"), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 6)
      return { label: "Too short", color: "#FF6B6B", pct: 20 };
    if (newPassword.length < 8)
      return { label: "Weak", color: "#FF6B6B", pct: 40 };
    if (newPassword.length < 10)
      return { label: "Medium", color: "#FFB347", pct: 65 };
    return { label: "Strong", color: "#51CF66", pct: 100 };
  };
  const strength = pwStrength();

  const content = (
    <View
      style={[
        styles.formBox,
        // Semi-transparent card background when over background image:
        isMobile
          ? { backgroundColor: styles.formBox.backgroundColor }
          : { backgroundColor: theme.card },
      ]}
    >
      {/* Back button */}
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => {
          if (step === "email") navigation.navigate("Login");
          else if (step === "otp") setStep("email");
          else setStep("otp");
        }}
      >
        <Ionicons name="arrow-back" size={16} color="#00467F" />
        <Text style={styles.backRowText}>
          {step === "email" ? "Back to Login" : "Back"}
        </Text>
      </TouchableOpacity>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {["email", "otp", "reset"].map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                step === s && styles.stepDotActive,
                (step === "otp" && i === 0) || (step === "reset" && i < 2)
                  ? styles.stepDotDone
                  : {},
              ]}
            >
              {(step === "otp" && i === 0) || (step === "reset" && i < 2) ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : (
                <Text
                  style={[styles.stepDotText, step === s && { color: "#fff" }]}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            {i < 2 && (
              <View
                style={[
                  styles.stepLine,
                  (step === "otp" && i === 0) || (step === "reset" && i < 2)
                    ? { backgroundColor: "#00467F" }
                    : {},
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* ── STEP 1: EMAIL ── */}
      {step === "email" && (
        <>
          <View style={styles.iconBox}>
            <Ionicons name="lock-closed-outline" size={32} color="#00467F" />
          </View>
          <Text
            style={[
              styles.formTitle,
              { color: theme.text, fontSize: fontSizes.xl },
            ]}
          >
            Forgot Password?
          </Text>
          <Text
            style={[
              styles.formSub,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            Enter your email address and we'll send you a 6-digit code to reset
            your password.
          </Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text
            style={[
              styles.label,
              { color: theme.subText, fontSize: fontSizes.xs },
            ]}
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
              style={[
                styles.input,
                { color: theme.text, fontSize: fontSizes.sm },
              ]}
              placeholder="Enter your registered email"
              placeholderTextColor={theme.subText}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={[styles.btnText, { fontSize: fontSizes.md }]}>
                  Send Reset Code
                </Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === "otp" && (
        <>
          <View style={styles.iconBox}>
            <Ionicons name="mail-outline" size={32} color="#00467F" />
          </View>
          <Text
            style={[
              styles.formTitle,
              { color: theme.text, fontSize: fontSizes.xl },
            ]}
          >
            Enter Reset Code
          </Text>
          <Text
            style={[
              styles.formSub,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            We sent a 6-digit code to{"\n"}
            <Text style={{ fontWeight: "700", color: "#00467F" }}>{email}</Text>
          </Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  otpRefs.current[i] = ref;
                }}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: digit ? "#00467F" : theme.border,
                    color: theme.text,
                  },
                ]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, i)}
                onKeyPress={({ nativeEvent }) =>
                  handleOtpKeyPress(nativeEvent.key, i)
                }
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              (loading || otp.join("").length !== 6) && { opacity: 0.6 },
            ]}
            onPress={handleVerifyOTP}
            disabled={loading || otp.join("").length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={[styles.btnText, { fontSize: fontSizes.md }]}>
                  Verify Code
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resendBtn, timer > 0 && { opacity: 0.5 }]}
            onPress={() => {
              if (timer > 0) return;
              setOtp(["", "", "", "", "", ""]);
              handleSendOTP();
            }}
            disabled={timer > 0}
          >
            <Text
              style={[
                styles.resendText,
                { color: theme.subText, fontSize: fontSizes.sm },
              ]}
            >
              {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* ── STEP 3: RESET ── */}
      {step === "reset" && (
        <>
          <View style={styles.iconBox}>
            <Ionicons name="key-outline" size={32} color="#00467F" />
          </View>
          <Text
            style={[
              styles.formTitle,
              { color: theme.text, fontSize: fontSizes.xl },
            ]}
          >
            Create New Password
          </Text>
          <Text
            style={[
              styles.formSub,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            Choose a strong password for your account.
          </Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {!!success && (
            <View style={styles.successBox}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color="#51CF66"
              />
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          <Text
            style={[
              styles.label,
              { color: theme.subText, fontSize: fontSizes.xs },
            ]}
          >
            New Password
          </Text>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="lock-open-outline"
              size={18}
              color={theme.subText}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                { color: theme.text, fontSize: fontSizes.sm },
              ]}
              placeholder="Enter new password"
              placeholderTextColor={theme.subText}
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Ionicons
                name={showNew ? "eye-outline" : "eye-off-outline"}
                size={18}
                color={theme.subText}
              />
            </TouchableOpacity>
          </View>
          {strength && (
            <View style={styles.strengthRow}>
              <View
                style={[
                  styles.strengthTrack,
                  { backgroundColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${strength.pct}%`,
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.label,
              { color: theme.subText, fontSize: fontSizes.xs },
            ]}
          >
            Confirm Password
          </Text>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              confirmPassword.length > 0 && {
                borderColor:
                  confirmPassword === newPassword ? "#51CF66" : "#FF6B6B",
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={theme.subText}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                { color: theme.text, fontSize: fontSizes.sm },
              ]}
              placeholder="Confirm new password"
              placeholderTextColor={theme.subText}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? "eye-outline" : "eye-off-outline"}
                size={18}
                color={theme.subText}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              (loading || !newPassword || newPassword !== confirmPassword) && {
                opacity: 0.6,
              },
            ]}
            onPress={handleResetPassword}
            disabled={
              loading || !newPassword || newPassword !== confirmPassword
            }
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={[styles.btnText, { fontSize: fontSizes.md }]}>
                  Reset Password
                </Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );

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

              <View style={styles.mobileHero}>
                <View style={styles.mobileLogoBadge}>
                  <Ionicons name="school" size={40} color="#1E293B" />
                  <View style={styles.tasselDot} />
                </View>
                <Text style={styles.heroTitle}>Hive</Text>
                <Text style={styles.heroSub}>Account Recovery</Text>
              </View>
              {content}
              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.webRoot, { backgroundColor: "#F5F7FF" }]}>
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
          <Text style={styles.webTitle}>Hive</Text>
          <Text style={styles.webSub}>Account Recovery</Text>
          <View style={styles.stepsInfo}>
            {[
              { icon: "mail-outline", label: "Enter your email" },
              { icon: "keypad-outline", label: "Enter the 6-digit code" },
              { icon: "lock-closed-outline", label: "Set a new password" },
            ].map((s, i) => (
              <View key={i} style={styles.stepsInfoItem}>
                <View
                  style={[
                    styles.stepsInfoIcon,
                    step === ["email", "otp", "reset"][i] && {
                      backgroundColor: "rgba(255,255,255,0.3)",
                    },
                  ]}
                >
                  <Ionicons name={s.icon as any} size={18} color="#fff" />
                </View>
                <Text style={styles.stepsInfoText}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.webRightContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
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
  webLeftContent: {
    padding: 48,
    zIndex: 1,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  authBackBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  mobileLogoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  webLogoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
  mobileSafe: { flex: 1 },
  mobileScroll: { flexGrow: 1 },
  mobileHero: {
    paddingTop: 36,
    paddingBottom: 20,
    alignItems: "center",
    position: "relative",
  },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.78)", marginTop: 4 },
  webRoot: { flexDirection: "row", flex: 1 },
  webLeft: {
    width: 400,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  webTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  webSub: { fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 32 },
  webRightContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 48,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  stepsInfo: { gap: 16 },
  stepsInfoItem: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepsInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepsInfoText: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
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
  formBox: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    // Semi-transparent container color with alpha channel so the background image shows through clearly:
    backgroundColor: "rgba(30, 41, 56, 0.75)", // RGBA color with alpha channel (e.g. rgba(30, 41, 56, 0.75) or rgba(15, 23, 42, 0.70))
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    elevation: 4,
    gap: 12,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  backRowText: { color: "#00467F", fontWeight: "600", fontSize: 13 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8ECF4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { backgroundColor: "#00467F" },
  stepDotDone: { backgroundColor: "#51CF66" },
  stepDotText: { fontSize: 12, fontWeight: "bold", color: "#888" },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E8ECF4",
    marginHorizontal: 4,
  },
  iconBox: { alignItems: "center" },
  stepEmoji: { fontSize: 52 },
  formTitle: { fontWeight: "bold", textAlign: "center" },
  formSub: { textAlign: "center", lineHeight: 22 },
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
  label: { fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1 },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginVertical: 8,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  btn: {
    backgroundColor: "#00467F",
    borderRadius: 12,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  resendBtn: { alignItems: "center", paddingVertical: 10 },
  resendText: { fontWeight: "500" },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  strengthTrack: { flex: 1, height: 4, borderRadius: 2 },
  strengthFill: { height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "600", width: 55 },
});
