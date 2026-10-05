import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsive } from "../components/useResponsive";
import { Radii } from "../constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Framed background photo matching exact reference crop
// Path: assets/images/welcome-bg.jpg (840x854 portrait framing)
const WELCOME_BG_IMAGE = require("../assets/images/welcome-bg.jpg");

export default function WelcomeScreen({ navigation }: any) {
  const { isMobile, width, height } = useResponsive();

  // Subtle entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, logoScaleAnim, slideAnim]);

  // ═══════════════════════════════════════════════════════════
  // DESKTOP / TABLET WEB LAYOUT (Split Screen)
  // ═══════════════════════════════════════════════════════════
  if (!isMobile) {
    return (
      <View style={styles.webContainer}>
        <StatusBar barStyle="light-content" translucent />

        {/* Floating Back to Admin button if navigable */}
        {navigation?.canGoBack?.() && (
          <View style={styles.webBackRow}>
            <TouchableOpacity
              style={styles.backFloatingBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to Admin Dashboard"
            >
              <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
              <Text style={styles.backFloatingBtnText}>Back to Admin</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Left Side: Photo with Floating Logo & Hive Title */}
        <View style={styles.webLeftPane}>
          <ImageBackground
            source={WELCOME_BG_IMAGE}
            style={styles.webHeroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.5)"]}
              style={styles.webHeroOverlay}
            >
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: logoScaleAnim }],
                  },
                ]}
              >
                <View style={styles.logoCard}>
                  <Ionicons name="school" size={48} color="#1E293B" />
                  <View style={styles.tasselAccent} />
                </View>
                <Text style={styles.logoText}>Hive</Text>
              </Animated.View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Right Side: Clean White Content Panel */}
        <View style={styles.webRightPane}>
          <Animated.View
            style={[
              styles.webCardInner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sheetTitle}>HIVE</Text>
            <Text style={styles.sheetSubtitle}>
              Where your interests meet your campus community
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>50+</Text>
                <Text style={styles.statLabel}>Groups</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>1K+</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
            </View>

            {/* CTA Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => navigation.navigate("Register")}
                style={styles.primaryButtonTouch}
              >
                <LinearGradient
                  colors={["#DE8536", "#C76D23"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    Get Started — It's Free
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginLeft: 8 }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("Login")}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  Already have an account?{" "}
                  <Text style={styles.secondaryButtonBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.webFooterText}>
              University of Ghana • Department of Computer Science
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MOBILE LAYOUT (Faithful to Reference Mockup)
  // ═══════════════════════════════════════════════════════════
  const dynamicWidth = width || SCREEN_WIDTH;
  const archHeight = 26;
  const halfWidth = dynamicWidth / 2;
  const archRadius = Math.round((halfWidth * halfWidth + archHeight * archHeight) / (2 * archHeight));
  const archDiameter = archRadius * 2;

  return (
    <View style={styles.mobileContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Half: Background photo with Logo & Hive branding */}
      <ImageBackground
        source={WELCOME_BG_IMAGE}
        style={styles.mobileBackgroundImage}
        imageStyle={styles.mobileBackgroundImageStyle}
        resizeMode="cover"
      >
        {/* Subtle gradient to ensure Hive logo text pops against trees */}
        <LinearGradient
          colors={["rgba(0,0,0,0.35)", "transparent", "rgba(0,0,0,0.15)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Back to Admin (if pushed from admin screen) */}
        {navigation?.canGoBack?.() && (
          <SafeAreaView style={styles.mobileBackSafeArea}>
            <TouchableOpacity
              style={styles.backFloatingBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to Admin Dashboard"
            >
              <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
              <Text style={styles.backFloatingBtnText}>Back to Admin</Text>
            </TouchableOpacity>
          </SafeAreaView>
        )}

        {/* Floating App Icon and 'Hive' branding in top hero area */}
        <Animated.View
          style={[
            styles.mobileBrandingContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: logoScaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCard}>
            <Ionicons name="school" size={46} color="#1E293B" />
            <View style={styles.tasselAccent} />
          </View>
          <Text style={styles.logoText}>Hive</Text>
        </Animated.View>
      </ImageBackground>

      {/* Bottom Sheet Card with Convex Arched Curve */}
      <View style={styles.sheetOuterContainer}>
        {/* Arched top cap creating the smooth dome curve */}
        <View style={styles.archCapContainer}>
          <View
            style={[
              styles.archCap,
              {
                width: archDiameter,
                height: archDiameter,
                borderRadius: archDiameter / 2,
              },
            ]}
          />
        </View>

        {/* White Card Body */}
        <Animated.View
          style={[
            styles.sheetBody,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Main Title */}
          <Text style={styles.sheetTitle}>HIVE</Text>

          {/* Subtitle / Tagline */}
          <Text style={styles.sheetSubtitle}>
            Where your interests meet your campus community
          </Text>

          {/* Statistics Section */}
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>50+</Text>
              <Text style={styles.statLabel}>Groups</Text>
            </View>

            <View style={styles.statColumn}>
              <Text style={styles.statValue}>1K+</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>

            <View style={styles.statColumn}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>

          {/* Primary Amber CTA Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate("Register")}
            style={styles.primaryButtonTouch}
            accessibilityRole="button"
            accessibilityLabel="Get Started — It's Free"
          >
            <LinearGradient
              colors={["#DE8536", "#C76D23"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>
                Get Started — It's Free
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Outlined Sign In Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Login")}
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel="Already have an account? Sign In"
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account?{" "}
              <Text style={styles.secondaryButtonBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const styles: any = StyleSheet.create({
  // ── Mobile Styles ──
  mobileContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mobileBackgroundImage: {
    // Exact numeric dimensions (numbers instead of percentages or flex)
    width: SCREEN_WIDTH, // Numeric width in pixels (e.g. SCREEN_WIDTH or exact number like 390)
    height: 480,         // Numeric height in pixels (e.g. 450, 480, 520)
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "center",
    overflow: "hidden",  // Clips image to exact container boundaries
  },
  mobileBackgroundImageStyle: {
    // Direct sizing, scaling, and framing controls on the image
    width: "100%",       // Can be "100%" or exact number (e.g. SCREEN_WIDTH or 400)
    height: "100%",      // Can be "100%" or exact number (e.g. 480 or 520)
    resizeMode: "cover" as const, // Options: "cover" | "contain" | "stretch" | "center"
    // Fine-tune image framing, position offsets, and zoom:
    transform: [
      { translateY: 0 }, // Shift vertically: negative moves up (e.g. -20), positive moves down (e.g. 20)
      { translateX: 0 }, // Shift horizontally: negative moves left (e.g. -15), positive moves right (e.g. 15)
      { scale: 1.0 },    // Zoom scale: > 1.0 zooms in (e.g. 1.08), < 1.0 zooms out (e.g. 0.95)
    ],
  },
  mobileBackSafeArea: {
    position: "absolute",
    top: Platform.OS === "android" ? 36 : 14,
    left: 20,
    zIndex: 99,
  },
  backFloatingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  backFloatingBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  mobileBrandingContainer: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 64 : 52,
  },
  logoCard: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  tasselAccent: {
    position: "absolute",
    bottom: 18,
    left: 24,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
  },
  logoText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 10,
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // ── Arched Bottom Sheet (White Card) ──
  sheetOuterContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 22,
    alignItems: "center",
  },
  archCapContainer: {
    position: "absolute",
    top: -26,
    left: 0,
    right: 0,
    height: 28,
    overflow: "hidden",
    alignItems: "center",
  },
  archCap: {
    backgroundColor: "#FFFFFF",
    position: "absolute",
    top: 0,
  },
  sheetBody: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    paddingTop: 8,
  },
  sheetTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 4,
  },
  sheetSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 280,
  },

  // ── Stats Section ──
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
    marginTop: 22,
    marginBottom: 24,
  },
  statColumn: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },

  // ── Action Buttons ──
  primaryButtonTouch: {
    width: "100%",
    marginBottom: 12,
  },
  primaryButtonGradient: {
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C76D23",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "#1E293B",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  secondaryButtonBold: {
    fontWeight: "700",
    color: "#111827",
  },

  // ── Desktop / Web Styles ──
  webContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
  },
  webBackRow: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 999,
  },
  webLeftPane: {
    flex: 1.1,
    height: "100%",
  },
  webHeroImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  webHeroOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  webRightPane: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
  },
  webCardInner: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
  },
  buttonGroup: {
    width: "100%",
  },
  webFooterText: {
    marginTop: 32,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
