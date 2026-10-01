import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsive } from "../components/useResponsive";
import { Palette, Shadows, Spacing, Radii } from "../constants/theme";
import PrimaryButton from "../components/ui/PrimaryButton";
import FloatingBee from "../components/ui/FloatingBee";

// ─────────────────────────────────────────────────────────────
// FEATURE & STATS DATA
// ─────────────────────────────────────────────────────────────

interface FeatureItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  color: string;
  bgColor: string;
}

const features: FeatureItem[] = [
  {
    icon: "people-outline",
    title: "Discover Groups",
    desc: "Find campus groups that match your interests & vibe",
    color: Palette.primary,
    bgColor: Palette.primaryLight,
  },
  {
    icon: "add-circle-outline",
    title: "Create & Manage",
    desc: "Start your own group and build a thriving community",
    color: Palette.accent,
    bgColor: Palette.accentLight,
  },
  {
    icon: "star-outline",
    title: "Join & Connect",
    desc: "Connect with students who share your passion & goals",
    color: Palette.success,
    bgColor: Palette.successLight,
  },
  {
    icon: "notifications-outline",
    title: "Stay Updated",
    desc: "Get real-time alerts on group activities and meetups",
    color: Palette.warning,
    bgColor: Palette.warningLight,
  },
];

const stats = [
  { value: "50+", label: "Groups", hint: "Active campus hubs" },
  { value: "1K+", label: "Students", hint: "Connected members" },
  { value: "8", label: "Categories", hint: "From tech to sports" },
];

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: Interactive Statistics Card
// ─────────────────────────────────────────────────────────────
interface StatCardProps {
  value: string;
  label: string;
  delayIndex: number;
  isWeb?: boolean;
}

function AnimatedStatCard({ value, label, delayIndex, isWeb }: StatCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // 1. Entrance spring pop on mount
    Animated.sequence([
      Animated.delay(350 + delayIndex * 120),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // 2. Subtle, continuous breathing pulse after entrance
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1600 + delayIndex * 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1600 + delayIndex * 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [delayIndex, opacityAnim, pulseAnim, scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isHovered ? 1.05 : 1.0,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverIn = () => {
    if (Platform.OS === "web") {
      setIsHovered(true);
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === "web") {
      setIsHovered(false);
      Animated.spring(scaleAnim, {
        toValue: 1.0,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View
      style={[
        isWeb ? styles.webStatCard : styles.mobileStatItem,
        {
          opacity: opacityAnim,
          transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
        },
        isHovered && styles.statCardHovered,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // @ts-ignore Web hover props
        onHoverIn={handleHoverIn}
        // @ts-ignore Web hover props
        onHoverOut={handleHoverOut}
        style={styles.statPressable}
        accessibilityRole="summary"
        accessibilityLabel={`${value} ${label}`}
      >
        <Text style={isWeb ? styles.webStatValue : styles.mobileStatValue}>
          {value}
        </Text>
        <Text style={isWeb ? styles.webStatLabel : styles.mobileStatLabel}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: Interactive Feature Action Card
// ─────────────────────────────────────────────────────────────
interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
  entranceAnim: Animated.Value;
  onPress: () => void;
  isWeb?: boolean;
}

function InteractiveFeatureCard({
  feature,
  index,
  entranceAnim,
  onPress,
  isWeb,
}: FeatureCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      tension: 120,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isHovered ? 1.02 : 1.0,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverIn = () => {
    if (Platform.OS === "web") {
      setIsHovered(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          tension: 90,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: -3,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === "web") {
      setIsHovered(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          tension: 90,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const translateY = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  return (
    <Animated.View
      style={[
        {
          opacity: entranceAnim,
          transform: [
            { translateY: Animated.add(translateY, liftAnim) },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // @ts-ignore Web hover props
        onHoverIn={handleHoverIn}
        // @ts-ignore Web hover props
        onHoverOut={handleHoverOut}
        style={[
          isWeb ? styles.webFeatureCard : styles.mobileFeatureRow,
          isHovered && {
            borderColor: feature.color,
            shadowColor: feature.color,
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 8,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${feature.title}: ${feature.desc}`}
      >
        <View
          style={[
            isWeb ? styles.webFeatureIcon : styles.mobileFeatureIcon,
            { backgroundColor: feature.bgColor },
          ]}
        >
          <Ionicons
            name={feature.icon}
            size={isWeb ? 22 : 20}
            color={feature.color}
          />
        </View>

        <View style={isWeb ? styles.webFeatureText : styles.mobileFeatureText}>
          <View style={styles.featureTitleRow}>
            <Text
              style={
                isWeb ? styles.webFeatureTitle : styles.mobileFeatureTitle
              }
            >
              {feature.title}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={isHovered ? feature.color : Palette.gray400}
              style={{
                marginLeft: 4,
                transform: [{ translateX: isHovered ? 2 : 0 }],
              }}
            />
          </View>
          <Text
            style={isWeb ? styles.webFeatureDesc : styles.mobileFeatureDesc}
          >
            {feature.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: Pulsing Attention-Grabber CTA Wrapper
// ─────────────────────────────────────────────────────────────
interface PulsingCTAProps {
  onPress: () => void;
  title?: string;
  isWeb?: boolean;
}

function PulsingCTA({
  onPress,
  title = "Get Started — It's Free",
  isWeb,
}: PulsingCTAProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    // Continuous soft looping pulse (breathing effect)
    const loopingAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(haloOpacity, {
            toValue: 0.75,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.35,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loopingAnimation.start();
    return () => loopingAnimation.stop();
  }, [haloOpacity, pulseAnim]);

  return (
    <View style={styles.ctaWrapper}>
      {/* Gentle glowing halo ring behind CTA */}
      <Animated.View
        style={[
          styles.ctaHalo,
          {
            opacity: haloOpacity,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      {/* Primary CTA with scale pulse */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <PrimaryButton
          title={title}
          icon="arrow-forward"
          iconPosition="right"
          size="lg"
          onPress={onPress}
          style={{ marginBottom: Spacing.md }}
        />
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT: WelcomeScreen
// ─────────────────────────────────────────────────────────────
export default function WelcomeScreen({ navigation }: any) {
  const { isMobile } = useResponsive();

  // Entrance animations (all hardware-accelerated via useNativeDriver: true)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(features.map(() => new Animated.Value(0))).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  // Header floating motion for the logo badge
  const headerFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Hero entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Staggered feature cards entrance
    const cardSequences = cardAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 250 + i * 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    Animated.parallel(cardSequences).start();

    // 3. CTA Entrance
    Animated.timing(ctaAnim, {
      toValue: 1,
      duration: 500,
      delay: 650,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // 4. Subtle continuous floating motion for hero badge
    const floatingHeader = Animated.loop(
      Animated.sequence([
        Animated.timing(headerFloatAnim, {
          toValue: -4,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(headerFloatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatingHeader.start();

    return () => floatingHeader.stop();
  }, [cardAnims, ctaAnim, fadeAnim, headerFloatAnim, slideAnim]);

  // ═══════════════════════════════════════════════════════════
  // WEB LAYOUT
  // ═══════════════════════════════════════════════════════════
  if (!isMobile) {
    return (
      <View style={styles.webPage}>
        {/* ── Left Hero Panel ── */}
        <View style={styles.webLeft}>
          {/* Decorative ambient elements */}
          <View style={styles.webCircle1} />
          <View style={styles.webCircle2} />
          <View style={styles.webCircle3} />

          <View style={styles.webLeftContent}>
            {/* Animated Logo Row with Lively Floating Bee */}
            <Animated.View
              style={[
                styles.webLogoRow,
                {
                  transform: [{ translateY: headerFloatAnim }],
                },
              ]}
            >
              <View style={styles.webLogoBadge}>
                <Text style={styles.webLogoEmoji}>🎓</Text>
              </View>
              <View style={styles.logoTitleGroup}>
                <Text style={styles.webLogoText}>Hive</Text>
                <FloatingBee size={28} style={styles.headerBeeOffset} />
              </View>
            </Animated.View>

            {/* Headline */}
            <Text style={styles.webHero}>Your Campus.</Text>
            <Text style={styles.webHero}>Your Community.</Text>

            <Text style={styles.webHeroSub}>
              Connect with students who share your passions, discover amazing
              campus groups, and build friendships that last a lifetime.
            </Text>

            {/* Interactive Statistics Cards */}
            <View style={styles.webStatsRow}>
              {stats.map((s, i) => (
                <AnimatedStatCard
                  key={i}
                  value={s.value}
                  label={s.label}
                  delayIndex={i}
                  isWeb={true}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ── Right Content Panel ── */}
        <ScrollView
          style={styles.webRight}
          contentContainerStyle={styles.webRightContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.webHeaderRow}>
            <Text style={styles.webRightTitle}>Welcome to Hive 👋</Text>
          </View>
          <Text style={styles.webRightSub}>
            The ultimate platform for University of Ghana students to discover,
            join, and manage vibrant campus groups.
          </Text>

          {/* Micro-Interactions for Action Cards */}
          <View style={styles.webFeatures}>
            {features.map((f, i) => (
              <InteractiveFeatureCard
                key={i}
                feature={f}
                index={i}
                entranceAnim={cardAnims[i]}
                onPress={() => navigation.navigate("Register")}
                isWeb={true}
              />
            ))}
          </View>

          {/* Looping Animated Call to Action */}
          <Animated.View style={{ opacity: ctaAnim }}>
            <PulsingCTA
              onPress={() => navigation.navigate("Register")}
              isWeb={true}
            />

            <TouchableOpacity
              style={styles.webSignIn}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign in to your account"
            >
              <Text style={styles.webSignInText}>Already have an account? </Text>
              <Text style={styles.webSignInLink}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.webFooter}>
            University of Ghana • Department of Computer Science
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.mobileSafe}>
      <ScrollView
        style={styles.mobileScroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ── Hero Section ── */}
        <View style={styles.mobileHero}>
          <View style={styles.mobileCircle1} />
          <View style={styles.mobileCircle2} />
          <View style={styles.mobileCircle3} />

          <Animated.View
            style={[
              styles.mobileHeroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Lively Floating Header Badge */}
            <Animated.View
              style={[
                styles.mobileLogoBadge,
                { transform: [{ translateY: headerFloatAnim }] },
              ]}
            >
              <Text style={styles.mobileLogoEmoji}>🎓</Text>
            </Animated.View>

            {/* Title with Lively Floating Bee */}
            <View style={styles.mobileLogoRow}>
              <Text style={styles.mobileLogoText}>Hive</Text>
              <FloatingBee size={28} style={styles.headerBeeOffset} />
            </View>

            <Text style={styles.mobileTagline}>
              Where your interests meet your campus community
            </Text>
          </Animated.View>

          {/* Interactive Statistics Glass Row */}
          <View style={styles.mobileStatsRow}>
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                <AnimatedStatCard
                  value={s.value}
                  label={s.label}
                  delayIndex={i}
                  isWeb={false}
                />
                {i < stats.length - 1 && (
                  <View style={styles.mobileStatDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Content Section ── */}
        <View style={styles.mobileContent}>
          <Text style={styles.mobileTitle}>
            Discover Your{"\n"}Campus Community
          </Text>
          <Text style={styles.mobileSub}>
            Connect with students who share your passions and build friendships
            that last a lifetime.
          </Text>

          {/* Micro-Interactions for Action Cards */}
          <View style={styles.mobileFeatures}>
            {features.map((f, i) => (
              <InteractiveFeatureCard
                key={i}
                feature={f}
                index={i}
                entranceAnim={cardAnims[i]}
                onPress={() => navigation.navigate("Register")}
                isWeb={false}
              />
            ))}
          </View>

          {/* Looping Animated Call to Action */}
          <Animated.View style={{ opacity: ctaAnim }}>
            <PulsingCTA
              onPress={() => navigation.navigate("Register")}
              isWeb={false}
            />

            <TouchableOpacity
              style={styles.mobileSignIn}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sign in to your account"
            >
              <Text style={styles.mobileSignInText}>
                Already have an account?
              </Text>
              <Text style={styles.mobileSignInLink}> Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.mobileFooter}>
            University of Ghana • Computer Science
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ── BRANDING & LOGO ─────────────────────────────────────
  logoTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBeeOffset: {
    marginLeft: 8,
  },
  featureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // ── CTA ATTENTION GRABBER ───────────────────────────────
  ctaWrapper: {
    position: "relative",
    alignItems: "stretch",
  },
  ctaHalo: {
    position: "absolute",
    top: 4,
    left: 8,
    right: 8,
    bottom: 18,
    backgroundColor: Palette.primary,
    borderRadius: Radii.lg,
    ...Shadows.primaryGlow,
  },

  // ── STATS INTERACTION ───────────────────────────────────
  statPressable: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  statCardHovered: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: "rgba(255,255,255,0.4)",
    borderWidth: 1,
  },

  // ── MOBILE LAYOUT ───────────────────────────────────────
  mobileSafe: {
    flex: 1,
    backgroundColor: Palette.gray50,
  },
  mobileScroll: {
    flex: 1,
    backgroundColor: Palette.gray50,
  },
  mobileHero: {
    backgroundColor: Palette.primary,
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: Spacing.xl,
    position: "relative",
    alignItems: "center",
    overflow: "hidden",
  },
  mobileCircle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -120,
    right: -80,
  },
  mobileCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -60,
    left: -60,
  },
  mobileCircle3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: 60,
    left: 40,
  },
  mobileHeroContent: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  mobileLogoBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    ...Shadows.md,
  },
  mobileLogoEmoji: {
    fontSize: 40,
  },
  mobileLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  mobileLogoText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  mobileTagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
    maxWidth: 280,
  },
  mobileStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: Radii.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    ...(Platform.OS === "web"
      ? { backdropFilter: "blur(14px)" as any }
      : {}),
    ...Shadows.sm,
  },
  mobileStatItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  mobileStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  mobileStatValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  mobileStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  mobileContent: {
    padding: Spacing.xl,
    paddingTop: Spacing["2xl"],
  },
  mobileTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Palette.gray800,
    marginBottom: Spacing.md,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  mobileSub: {
    fontSize: 15,
    color: Palette.gray500,
    lineHeight: 24,
    marginBottom: 26,
  },
  mobileFeatures: {
    gap: 12,
    marginBottom: Spacing["2xl"],
  },
  mobileFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Palette.white,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...Shadows.md,
  },
  mobileFeatureIcon: {
    width: 46,
    height: 46,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileFeatureText: { flex: 1 },
  mobileFeatureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.gray800,
    marginBottom: 3,
  },
  mobileFeatureDesc: {
    fontSize: 13,
    color: Palette.gray500,
    lineHeight: 18,
  },
  mobileSignIn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: Palette.white,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Palette.gray200,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  mobileSignInText: {
    fontSize: 15,
    color: Palette.gray500,
  },
  mobileSignInLink: {
    fontSize: 15,
    color: Palette.primary,
    fontWeight: "700",
  },
  mobileFooter: {
    textAlign: "center",
    fontSize: 12,
    color: Palette.gray400,
    marginBottom: 20,
  },

  // ── WEB LAYOUT ──────────────────────────────────────────
  webPage: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: Palette.gray50,
  },
  webLeft: {
    width: "45%",
    backgroundColor: Palette.primary,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  webLeftContent: {
    paddingHorizontal: 56,
    paddingVertical: 48,
    zIndex: 1,
  },
  webCircle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -140,
    right: -100,
  },
  webCircle2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -100,
    left: -80,
  },
  webCircle3: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.03)",
    top: "40%",
    left: "15%",
  },
  webLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 44,
  },
  webLogoBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    ...Shadows.md,
  },
  webLogoEmoji: { fontSize: 26 },
  webLogoText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  webHero: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 56,
    letterSpacing: -0.5,
  },
  webHeroSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 26,
    marginTop: 20,
    marginBottom: 40,
    maxWidth: 420,
  },
  webStatsRow: {
    flexDirection: "row",
    gap: 16,
  },
  webStatCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: Radii.md,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: "center",
    minWidth: 96,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...(Platform.OS === "web"
      ? { backdropFilter: "blur(12px)" as any }
      : {}),
    ...Shadows.sm,
  },
  webStatValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  webStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    fontWeight: "600",
  },
  webRight: { flex: 1 },
  webRightContent: {
    padding: 56,
    maxWidth: 580,
    alignSelf: "center",
    width: "100%",
  },
  webHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  webRightTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Palette.gray800,
    letterSpacing: -0.3,
  },
  webRightSub: {
    fontSize: 15,
    color: Palette.gray500,
    lineHeight: 24,
    marginBottom: 32,
  },
  webFeatures: { gap: 14, marginBottom: 32 },
  webFeatureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: Palette.white,
    borderRadius: Radii.lg,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...Shadows.md,
  },
  webFeatureIcon: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  webFeatureText: { flex: 1 },
  webFeatureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.gray800,
    marginBottom: 3,
  },
  webFeatureDesc: {
    fontSize: 13,
    color: Palette.gray500,
    lineHeight: 20,
  },
  webSignIn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    paddingVertical: 10,
  },
  webSignInText: { fontSize: 15, color: Palette.gray500 },
  webSignInLink: {
    fontSize: 15,
    color: Palette.primary,
    fontWeight: "700",
  },
  webFooter: {
    textAlign: "center",
    fontSize: 12,
    color: Palette.gray400,
  },
});

