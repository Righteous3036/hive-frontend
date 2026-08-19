import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsive } from "../components/useResponsive";

const { width } = Dimensions.get("window");

const features = [
  {
    icon: "people-outline",
    title: "Discover Groups",
    desc: "Find campus groups that match your interests",
  },
  {
    icon: "add-circle-outline",
    title: "Create & Manage",
    desc: "Start your own group and build a community",
  },
  {
    icon: "star-outline",
    title: "Join & Connect",
    desc: "Connect with students who share your passion",
  },
  {
    icon: "notifications-outline",
    title: "Stay Updated",
    desc: "Get notified about group activities and events",
  },
];

const stats = [
  { value: "50+", label: "Groups" },
  { value: "1K+", label: "Students" },
  { value: "8", label: "Categories" },
];

export default function WelcomeScreen({ navigation }: any) {
  const { isMobile } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  if (!isMobile) {
    // Web version — keep the original split layout
    return (
      <View style={styles.webPage}>
        {/* Left Panel */}
        <View style={styles.webLeft}>
          <View style={styles.webCircle1} />
          <View style={styles.webCircle2} />
          <View style={styles.webLogoRow}>
            <Text style={styles.webLogoEmoji}>🎓</Text>
            <Text style={styles.webLogoText}>Hive 🐝</Text>
          </View>
          <Text style={styles.webHero}>Your Campus.</Text>
          <Text style={styles.webHero}>Your Community.</Text>
          <Text style={styles.webHeroSub}>
            Connect with students who share your passions, discover amazing
            campus groups, and build friendships that last a lifetime.
          </Text>
          <View style={styles.webStats}>
            {stats.map((s, i) => (
              <View key={i} style={styles.webStatItem}>
                <Text style={styles.webStatValue}>{s.value}</Text>
                <Text style={styles.webStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Panel */}
        <ScrollView
          style={styles.webRight}
          contentContainerStyle={styles.webRightContent}
        >
          <Text style={styles.webRightTitle}>Welcome to Hive 👋</Text>
          <Text style={styles.webRightSub}>
            The ultimate platform for University of Ghana students to discover,
            join and manage campus groups.
          </Text>

          <View style={styles.webFeatures}>
            {features.map((f, i) => (
              <View key={i} style={styles.webFeatureCard}>
                <View style={styles.webFeatureIcon}>
                  <Ionicons name={f.icon as any} size={22} color="#00467F" />
                </View>
                <View style={styles.webFeatureText}>
                  <Text style={styles.webFeatureTitle}>{f.title}</Text>
                  <Text style={styles.webFeatureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.webGetStarted}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.webGetStartedText}>
              Get Started — It's Free
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.webSignIn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.webSignInText}>Already have an account? </Text>
            <Text style={styles.webSignInLink}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.webFooter}>
            University of Ghana • Department of Computer Science
          </Text>
        </ScrollView>
      </View>
    );
  }

  // Mobile version
  return (
    <SafeAreaView style={styles.mobileSafe}>
      <ScrollView
        style={styles.mobileScroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Section */}
        <View style={styles.mobileHero}>
          <View style={styles.mobileCircle1} />
          <View style={styles.mobileCircle2} />

          <Animated.View
            style={[
              styles.mobileHeroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.mobileLogoEmoji}>🎓</Text>
            <Text style={styles.mobileLogoText}>Hive 🐝</Text>
            <Text style={styles.mobileTagline}>
              Where your interests meet your community
            </Text>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.mobileStatsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.mobileStatItem}>
                <Text style={styles.mobileStatValue}>{s.value}</Text>
                <Text style={styles.mobileStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.mobileContent}>
          <Text style={styles.mobileTitle}>
            Discover Your{"\n"}Campus Community
          </Text>
          <Text style={styles.mobileSub}>
            Connect with students who share your passions and build friendships
            that last a lifetime.
          </Text>

          {/* Features */}
          <View style={styles.mobileFeatures}>
            {features.map((f, i) => (
              <View key={i} style={styles.mobileFeatureRow}>
                <View style={styles.mobileFeatureIcon}>
                  <Ionicons name={f.icon as any} size={20} color="#00467F" />
                </View>
                <View style={styles.mobileFeatureText}>
                  <Text style={styles.mobileFeatureTitle}>{f.title}</Text>
                  <Text style={styles.mobileFeatureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.mobileGetStarted}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.8}
          >
            <Text style={styles.mobileGetStartedText}>
              Get Started — It's Free
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mobileSignIn}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <Text style={styles.mobileSignInText}>
              Already have an account?
            </Text>
            <Text style={styles.mobileSignInLink}> Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.mobileFooter}>
            University of Ghana • Computer Science
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── MOBILE ──
  mobileSafe: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },
  mobileScroll: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },
  mobileHero: {
    backgroundColor: "#00467F",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: "relative",

    alignItems: "center",
  },
  mobileCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -100,
    right: -80,
  },
  mobileCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -60,
    left: -60,
  },
  mobileHeroContent: {
    alignItems: "center",
    marginBottom: 32,
  },
  mobileLogoEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  mobileLogoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  mobileTagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  mobileStatsRow: {
    flexDirection: "row",
    gap: 0,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,

    width: "100%",
  },
  mobileStatItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.15)",
  },
  mobileStatValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  mobileStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  mobileContent: {
    padding: 24,
    paddingTop: 32,
  },
  mobileTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 12,
    lineHeight: 36,
  },
  mobileSub: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    marginBottom: 28,
  },
  mobileFeatures: {
    gap: 16,
    marginBottom: 32,
  },
  mobileFeatureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mobileFeatureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileFeatureText: { flex: 1 },
  mobileFeatureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 3,
  },
  mobileFeatureDesc: {
    fontSize: 13,
    color: "#888",
    lineHeight: 18,
  },
  mobileGetStarted: {
    backgroundColor: "#00467F",
    borderRadius: 14,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
    shadowColor: "#00467F",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  mobileGetStartedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  mobileSignIn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E8ECF4",
    marginBottom: 24,
  },
  mobileSignInText: {
    fontSize: 15,
    color: "#888",
  },
  mobileSignInLink: {
    fontSize: 15,
    color: "#00467F",
    fontWeight: "bold",
  },
  mobileFooter: {
    textAlign: "center",
    fontSize: 12,
    color: "#bbb",
    marginBottom: 20,
  },

  // ── WEB ──
  webPage: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#F5F7FF",
  },
  webLeft: {
    width: "45%",
    backgroundColor: "#00467F",
    padding: 48,
    justifyContent: "center",
    position: "relative",
  },
  webCircle1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -100,
    right: -80,
  },
  webCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -80,
    left: -60,
  },
  webLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  webLogoEmoji: { fontSize: 36 },
  webLogoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  webHero: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    lineHeight: 52,
  },
  webHeroSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 26,
    marginTop: 20,
    marginBottom: 40,
  },
  webStats: {
    flexDirection: "row",
    gap: 32,
  },
  webStatItem: { alignItems: "center" },
  webStatValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  webStatLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  webRight: { flex: 1 },
  webRightContent: {
    padding: 52,
    maxWidth: 560,
    alignSelf: "center",
    width: "100%",
  },
  webRightTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 12,
  },
  webRightSub: {
    fontSize: 15,
    color: "#888",
    lineHeight: 24,
    marginBottom: 36,
  },
  webFeatures: { gap: 16, marginBottom: 36 },
  webFeatureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  webFeatureIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#EFF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  webFeatureText: { flex: 1 },
  webFeatureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  webFeatureDesc: {
    fontSize: 13,
    color: "#888",
    lineHeight: 20,
  },
  webGetStarted: {
    backgroundColor: "#00467F",
    borderRadius: 14,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  webGetStartedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  webSignIn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  webSignInText: { fontSize: 15, color: "#888" },
  webSignInLink: {
    fontSize: 15,
    color: "#00467F",
    fontWeight: "bold",
  },
  webFooter: {
    textAlign: "center",
    fontSize: 12,
    color: "#bbb",
  },
});
