import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: ViewStyle;
};

export default function FloatingBee({ size = 20, style }: Props) {
  // Animated value for vertical bobbing (0 -> 1 -> 0)
  const bobAnim = useRef(new Animated.Value(0)).current;
  // Animated value for subtle tilt rotation (0 -> 1 -> 0)
  const tiltAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth infinite floating oscillation
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bobAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(tiltAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bobAnim, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(tiltAnim, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    floatingAnimation.start();

    return () => {
      floatingAnimation.stop();
    };
  }, [bobAnim, tiltAnim]);

  // Interpolate translateY: floats gently between -3px and +2.5px
  const translateY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2.5, -3.5],
  });

  // Interpolate rotation: tilts slightly between -5deg and +6deg
  const rotate = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '7deg'],
  });

  // Interpolate scale: subtle breathing effect
  const scale = bobAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 0.98],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { rotate }, { scale }],
        },
        style,
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size, lineHeight: size + 4 }]}>
        🐝
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
