import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, Platform, StyleProp } from "react-native";

interface AnimatedEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  slideDistance?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  style?: StyleProp<ViewStyle>;
}

export function AnimatedEntrance({
  children,
  delay = 0,
  duration = 450,
  slideDistance = 18,
  direction = "up",
  style,
}: AnimatedEntranceProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(slideDistance)).current;

  useEffect(() => {
    const isWeb = Platform.OS === "web";
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: !isWeb,
      }),
    ]).start();
  }, [delay, duration]);

  const transformStyle =
    direction === "up"
      ? { transform: [{ translateY: translate }] }
      : direction === "down"
      ? {
          transform: [
            {
              translateY: translate.interpolate({
                inputRange: [0, slideDistance],
                outputRange: [0, -slideDistance],
              }),
            },
          ],
        }
      : direction === "left"
      ? { transform: [{ translateX: translate }] }
      : direction === "right"
      ? {
          transform: [
            {
              translateX: translate.interpolate({
                inputRange: [0, slideDistance],
                outputRange: [0, -slideDistance],
              }),
            },
          ],
        }
      : {};

  return (
    <Animated.View style={[{ opacity }, transformStyle, style]}>
      {children}
    </Animated.View>
  );
}

export default AnimatedEntrance;
