import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'none';
  distance?: number;
  style?: ViewStyle | ViewStyle[];
};

export default function FadeInView({
  children,
  delay = 0,
  duration = 380,
  direction = 'up',
  distance = 18,
  style,
}: Props) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(
    new Animated.Value(
      direction === 'up' ? distance : direction === 'down' ? -distance : 0
    )
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.spring(translateAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 9,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, direction, distance]);

  return (
    <Animated.View
      style={[
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
