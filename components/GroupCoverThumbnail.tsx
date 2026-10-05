import React, { useState, useEffect } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Radii } from "../constants/theme";
import { getCategory3DIcon } from "../constants/categories";

export const CATEGORY_FALLBACK_COVERS: Record<string, string> = {
  tech: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=75",
  study: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=75",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=75",
  arts: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=75",
  dance: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=75",
  business: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=75",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=75",
  social: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=75",
};

export const DEFAULT_CAMPUS_IMAGE: ImageSourcePropType = require("../assets/images/campus-banner.jpg");

// ─────────────────────────────────────────────────────────────
// 1. Group Profile Picture Thumbnail (Small Section)
// Displays the group's profile picture fetched from the DB
// ─────────────────────────────────────────────────────────────
export interface GroupProfileThumbnailProps {
  profileImage?: string | null;
  coverImage?: string | null;
  category?: string;
  fallbackIcon?: string;
  color?: string;
  size?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function GroupProfileThumbnail({
  profileImage,
  category = "study",
  fallbackIcon,
  color = "#00467F",
  size = 40,
  borderRadius = 10,
  style,
}: GroupProfileThumbnailProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [profileImage]);

  // Requirement 1: In the small avatar/thumbnail section, display the group's profile picture
  const profileUri = profileImage?.trim();

  return (
    <View
      style={[
        styles.avatarBox,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: color + "30",
          borderColor: "rgba(255, 255, 255, 0.40)",
        },
        style as any,
      ]}
    >
      {profileUri && !imgError ? (
        <Image
          source={{ uri: profileUri }}
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%", borderRadius: borderRadius - 1 }]}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={styles.fallbackBox as any}>
          <Image
            source={getCategory3DIcon(category)}
            style={{
              width: Math.round(size * 0.65),
              height: Math.round(size * 0.65),
            }}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Cover Photo Background Header (Hero Card Style)
// Uses group's cover picture as full background image with exact
// Hero card layout, resizeMode="cover", rounded corners, and gradient
// ─────────────────────────────────────────────────────────────
export interface GroupCoverHeaderProps {
  coverImage?: string | null;
  category?: string;
  height?: number;
  borderRadius?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export function GroupCoverHeader({
  coverImage,
  category = "study",
  height = 96,
  borderRadius = Radii.xl,
  children,
  style,
  imageStyle,
}: GroupCoverHeaderProps) {
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    setCoverError(false);
  }, [coverImage]);

  const catKey = (category || "").toLowerCase();
  const customCover = coverImage?.trim();
  const fallbackCoverUri = CATEGORY_FALLBACK_COVERS[catKey];

  // Resolve cover image source with priority: custom cover_image -> category fallback -> campus hero banner
  const coverSource: ImageSourcePropType =
    customCover && !coverError
      ? { uri: customCover }
      : fallbackCoverUri && !coverError
      ? { uri: fallbackCoverUri }
      : DEFAULT_CAMPUS_IMAGE;

  return (
    <ImageBackground
      source={coverSource}
      style={[
        styles.heroStyleCoverHeader,
        {
          height,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
        },
        style as any,
      ]}
      imageStyle={[
        styles.heroStyleCoverImage,
        {
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
        },
        imageStyle as any,
      ]}
      onError={() => setCoverError(true)}
    >
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.48)",
          "rgba(0, 0, 0, 0.22)",
          "rgba(0, 0, 0, 0.55)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.25, y: 1 }}
        style={styles.heroCoverGradient as any}
      >
        {children}
      </LinearGradient>
    </ImageBackground>
  );
}

// Default export kept compatible for existing usages:
export default GroupProfileThumbnail;

const styles = StyleSheet.create({
  // Small Profile Picture Thumbnail Box (Screenshot 9)
  avatarBox: {
    borderWidth: 1.5,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  fallbackBox: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero Card Style Cover Header (Screenshot 10 fitting)
  heroStyleCoverHeader: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#0B1120",
  },
  heroStyleCoverImage: {
    // ── Direct Sizing & Scaling Controls (Same as HomeScreen Hero Card) ──
    width: "100%",
    height: "100%",
    resizeMode: "cover" as const,
    // ── Fine-tune Framing & Position Offsets ──
    transform: [
      { translateY: 0 },
      { translateX: 0 },
      { scale: 1.0 },
    ],
  },
  heroCoverGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
});
