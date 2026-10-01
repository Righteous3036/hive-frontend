import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, ViewStyle } from "react-native";
import { useIsFocused } from "@react-navigation/native";

interface ScreenTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

/**
 * ScreenTransition:
 * Wraps screen content to provide an organic, fluid fade-in and subtle
 * upward glide whenever navigating between screens via the bottom navigation bar.
 */
export default function ScreenTransition({ children, style }: ScreenTransitionProps) {
  const isFocused = useIsFocused();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (isFocused) {
      opacityAnim.setValue(0);
      slideAnim.setValue(12);

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
