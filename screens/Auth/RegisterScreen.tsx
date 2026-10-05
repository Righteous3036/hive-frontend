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
import api, { setToken } from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";
import { useResponsive } from "../../components/useResponsive";
import { Palette, Radii, Shadows, Spacing } from "../../constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AUTH_BG_IMAGE = require("../../assets/images/welcome-bg.jpg");

export default function RegisterScreen({ navigation }: any) {
  const { isMobile } = useResponsive();
  const { theme, fontSizes } = useTheme();
  const { setUser } = useUser();

  // Step 1 — Form
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Step 2 — OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<any[]>([]);
  const [otpTimer, setOtpTimer] = useState(60);
  const timerRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getStrength = () => {
    if (!password) return null;
    if (password.length < 6)
      return { label: "Too short", color: "#FF6B6B", pct: 20 };
    if (password.length < 8)
      return { label: "Weak", color: "#FF6B6B", pct: 40 };
    if (password.length < 10)
      return { label: "Medium", color: "#FFB347", pct: 65 };
    return { label: "Strong", color: "#51CF66", pct: 100 };
  };
  const strength = getStrength();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validateStudentId = (id: string) => /^\d{8,10}$/.test(id);

  const startTimer = () => {
    setOtpTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    setError("");

    if (!name || !email || !studentId || !department || !level || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!validateStudentId(studentId)) {
      setError("Student ID must be 8 to 10 digits only (numbers only)");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/send-otp", {
        email,
        name,
        student_id: studentId,
      });
      if (res.data.success) {
        setStep("otp");
        startTimer();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to send code. Please try again.",
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
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
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
      const res = await api.post("/auth/register", {
        name,
        email,
        student_id: studentId,
        department,
        level,
        password,
        otp: otpCode,
      });
      if (res.data.success) {
        setToken(res.data.token);
        setUser({
          ...res.data.user,
          token: res.data.token,
          profile_picture: null,
          cover_photo: null,
          bio: "",
        });
        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigation.navigate("AIMatching"), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email, name, student_id: studentId });
      setOtp(["", "", "", "", "", ""]);
      startTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP STEP ──
  const otpContent = (
    <View
      style={[
        styles.formBox,
        // Semi-transparent card background when over background image:
        isMobile
          ? { backgroundColor: styles.formBox.backgroundColor }
          : { backgroundColor: theme.card },
      ]}
    >
      <TouchableOpacity
        style={styles.backToForm}
        onPress={() => {
          setStep("form");
          setError("");
          setOtp(["", "", "", "", "", ""]);
        }}
      >
        <Ionicons name="arrow-back" size={16} color={theme.primary} />
        <Text style={[styles.backToFormText, { color: theme.primary }]}>Back</Text>
      </TouchableOpacity>

      <View style={styles.otpIconBox}>
        <Ionicons name="mail-outline" size={32} color="#00467F" />
      </View>

      <Text
        style={[
          styles.formTitle,
          { color: theme.text, fontSize: fontSizes.xl },
        ]}
      >
        Check your email
      </Text>
      <Text
        style={[
          styles.formSub,
          { color: theme.subText, fontSize: fontSizes.sm },
        ]}
      >
        We sent a 6-digit code to{"\n"}
        <Text style={{ color: theme.primary, fontWeight: "700" }}>{email}</Text>
      </Text>

      {!!error && (
        <View style={[styles.errorBox, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      )}

      {!!success && (
        <View style={[styles.successBox, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
          <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
          <Text style={[styles.successText, { color: theme.success }]}>{success}</Text>
        </View>
      )}

      {/* OTP Boxes */}
      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => {
              if (ref) otpRefs.current[i] = ref;
            }}
            style={[
              styles.otpBox,
              {
                backgroundColor: theme.inputBg,
                borderColor: digit ? theme.primary : theme.border,
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
          styles.submitBtn,
          (loading || otp.join("").length !== 6) && { opacity: 0.6 },
        ]}
        onPress={handleVerifyOTP}
        disabled={loading || otp.join("").length !== 6}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={[styles.submitBtnText, { fontSize: fontSizes.md }]}>
              Verify & Create Account
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendBtn, otpTimer > 0 && { opacity: 0.5 }]}
        onPress={handleResendOTP}
        disabled={otpTimer > 0 || loading}
      >
        <Text
          style={[
            styles.resendBtnText,
            { color: theme.subText, fontSize: fontSizes.sm },
          ]}
        >
          {otpTimer > 0 ? `Resend code in ${otpTimer}s` : "Resend code"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── FORM STEP ──
  const formContent = (
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
        Create Account
      </Text>
      <Text
        style={[
          styles.formSub,
          { color: theme.subText, fontSize: fontSizes.sm },
        ]}
      >
        Join thousands of students on campus
      </Text>

      {!!error && (
        <View style={[styles.errorBox, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      )}

      {/* Full Name */}
      <Text
        style={[styles.label, { color: theme.subText, fontSize: fontSizes.xs }]}
      >
        Full Name
      </Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name="person-outline"
          size={18}
          color={theme.subText}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.text, fontSize: fontSizes.md }]}
          placeholder="Enter your full name"
          placeholderTextColor={theme.subText}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Email */}
      <Text
        style={[styles.label, { color: theme.subText, fontSize: fontSizes.xs }]}
      >
        University Email
      </Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
          email.length > 0 && {
            borderColor: validateEmail(email) ? theme.success : theme.error,
          },
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
          placeholder="yourname@ug.edu.gh"
          placeholderTextColor={theme.subText}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {email.length > 0 && (
          <Ionicons
            name={validateEmail(email) ? "checkmark-circle" : "close-circle"}
            size={18}
            color={validateEmail(email) ? theme.success : theme.error}
          />
        )}
      </View>

      {/* Student ID + Department */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text
            style={[
              styles.label,
              { color: theme.subText, fontSize: fontSizes.xs },
            ]}
          >
            Student ID
          </Text>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
              studentId.length > 0 && {
                borderColor: validateStudentId(studentId)
                  ? theme.success
                  : theme.error,
              },
            ]}
          >
            <Ionicons
              name="card-outline"
              size={16}
              color={theme.subText}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                { color: theme.text, fontSize: fontSizes.sm },
              ]}
              placeholder="10XXXXXXX"
              placeholderTextColor={theme.subText}
              keyboardType="number-pad"
              value={studentId}
              onChangeText={setStudentId}
              maxLength={10}
            />
          </View>
          {studentId.length > 0 && !validateStudentId(studentId) && (
            <Text style={styles.fieldHint}>8-10 digits only</Text>
          )}
        </View>
        <View style={styles.half}>
          <Text
            style={[
              styles.label,
              { color: theme.subText, fontSize: fontSizes.xs },
            ]}
          >
            Department
          </Text>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="school-outline"
              size={16}
              color={theme.subText}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                { color: theme.text, fontSize: fontSizes.sm },
              ]}
              placeholder="e.g. CS"
              placeholderTextColor={theme.subText}
              value={department}
              onChangeText={setDepartment}
            />
          </View>
        </View>
      </View>

      {/* Level */}
      <Text
        style={[styles.label, { color: theme.subText, fontSize: fontSizes.xs }]}
      >
        Level
      </Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name="layers-outline"
          size={18}
          color={theme.subText}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: theme.text, fontSize: fontSizes.md }]}
          placeholder="e.g. Level 300"
          placeholderTextColor={theme.subText}
          value={level}
          onChangeText={setLevel}
        />
      </View>

      {/* Password */}
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
          placeholder="Create a strong password"
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
      {strength && (
        <View style={styles.strengthRow}>
          <View
            style={[styles.strengthTrack, { backgroundColor: theme.border }]}
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

      {/* Confirm Password */}
      <Text
        style={[styles.label, { color: theme.subText, fontSize: fontSizes.xs }]}
      >
        Confirm Password
      </Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
          confirmPassword.length > 0 && {
            borderColor: confirmPassword === password ? theme.success : theme.error,
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
          style={[styles.input, { color: theme.text, fontSize: fontSizes.md }]}
          placeholder="Re-enter your password"
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

      {/* Terms */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => setAgreed(!agreed)}
      >
        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
          {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
        </View>
        <Text
          style={[
            styles.termsText,
            { color: theme.subText, fontSize: fontSizes.xs },
          ]}
        >
          I agree to the <Text style={styles.termsLink}>Terms of Service</Text>{" "}
          and <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, (!agreed || loading) && { opacity: 0.6 }]}
        onPress={handleSendOTP}
        disabled={!agreed || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={[styles.submitBtnText, { fontSize: fontSizes.md }]}>
              Send Verification Code
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <Text
          style={[
            styles.loginText,
            { color: theme.subText, fontSize: fontSizes.sm },
          ]}
        >
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.loginLink, { fontSize: fontSizes.sm }]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.footer,
          { color: theme.subText, fontSize: fontSizes.xs },
        ]}
      >
        University of Ghana • Computer Science
      </Text>
    </View>
  );

  const content = step === "otp" ? otpContent : formContent;

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
              <View style={styles.mobileHero}>
                {step === "form" ? (
                  <>
                    <TouchableOpacity
                      style={styles.backBtn}
                      onPress={() => navigation.navigate("Login")}
                    >
                      <Ionicons name="arrow-back" size={16} color="#fff" />
                      <Text style={styles.backBtnText}>Back to Login</Text>
                    </TouchableOpacity>
                    <View style={styles.mobileLogoBadge}>
                      <Ionicons name="school" size={40} color="#1E293B" />
                      <View style={styles.tasselDot} />
                    </View>
                    <Text style={styles.mobileAppName}>Join Hive</Text>
                    <Text style={styles.mobileTagline}>
                      Where your interests meet your campus community
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.mobileLogoBadge}>
                      <Ionicons name="mail-open" size={36} color="#1E293B" />
                    </View>
                    <Text style={styles.mobileAppName}>Verify Your Email</Text>
                    <Text style={styles.mobileTagline}>
                      Enter the 6-digit code we sent you
                    </Text>
                  </>
                )}
              </View>
              <View style={styles.mobileFormWrap}>{content}</View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ── WEB ──
  return (
    <View style={[styles.webRoot, { backgroundColor: Palette.gray50 }]}>
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
          <Text style={styles.webAppName}>Join Hive</Text>
          <Text style={styles.webTagline}>Where your interests meet your campus community</Text>
          {[
            {
              step: "01",
              title: "Fill in your details",
              desc: "Enter your student information",
            },
            {
              step: "02",
              title: "Verify your email",
              desc: "Enter the OTP sent to your email",
            },
            {
              step: "03",
              title: "Discover groups",
              desc: "AI matches you with the best groups",
            },
          ].map((s, i) => (
            <View key={i} style={styles.stepItem}>
              <View
                style={[
                  styles.stepBadge,
                  i < (step === "otp" ? 1 : 0) && { backgroundColor: Palette.success },
                ]}
              >
                <Text style={styles.stepNum}>{s.step}</Text>
              </View>
              <View>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
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
  mobileSafe: { flex: 1 },
  mobileScroll: { flexGrow: 1 },
  mobileHero: {
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    position: "relative",
  },
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
  webLogoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
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
  mobileFormWrap: { flex: 1 },
  mobileEmoji: { fontSize: 52, marginBottom: 10, zIndex: 1 },
  mobileAppName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  mobileTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
  },
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
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    alignSelf: "flex-start",
    marginBottom: Spacing.xl,
    minHeight: 44,
  },
  backBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  webRoot: { flexDirection: "row", flex: 1 },
  webLeft: {
    width: 420,
    backgroundColor: Palette.primary,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  webLeftContent: {
    padding: 48,
    zIndex: 1,
  },
  webEmoji: { fontSize: 48, marginBottom: 10 },
  webAppName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  webTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 32,
  },
  webRightContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 48,
    maxWidth: 540,
    alignSelf: "center",
    width: "100%",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
  },
  stepBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stepTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  stepDesc: { color: "rgba(255,255,255,0.6)", fontSize: 12 },

  // Form
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
  formSub: { marginBottom: 20, lineHeight: 22 },

  // OTP
  backToForm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 20,
    minHeight: 44,
  },
  backToFormText: { fontWeight: "600", fontSize: 14 },
  otpIconBox: { alignItems: "center", marginBottom: Spacing.lg },
  otpEmoji: { fontSize: 56 },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginVertical: Spacing.xl,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: Radii.md,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  resendBtn: { alignItems: "center", paddingVertical: Spacing.md, minHeight: 44 },
  resendBtnText: { fontWeight: "500" },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: 14,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, flex: 1 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: 14,
    borderWidth: 1,
  },
  successText: { fontSize: 13, flex: 1 },

  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  label: { fontWeight: "600", marginBottom: 6 },
  fieldHint: { fontSize: 11, color: Palette.error, marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    height: 50,
    marginBottom: 14,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1 },

  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -8,
    marginBottom: 14,
  },
  strengthTrack: { flex: 1, height: 5, borderRadius: 3 },
  strengthFill: { height: 5, borderRadius: 3 },
  strengthLabel: { fontSize: 11, fontWeight: "600", width: 55 },

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
    minHeight: 44,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: Palette.primary },
  termsText: { flex: 1, lineHeight: 20 },
  termsLink: { color: Palette.primary, fontWeight: "700" },

  submitBtn: {
    backgroundColor: Palette.primary,
    borderRadius: Radii.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.lg,
    ...Shadows.primaryGlow,
  },
  submitBtnText: { color: "#fff", fontWeight: "700" },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  loginText: {},
  loginLink: { color: Palette.primary, fontWeight: "700" },
  footer: { textAlign: "center" },
});
