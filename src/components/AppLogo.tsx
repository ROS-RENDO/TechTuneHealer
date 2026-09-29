import React from "react";
import { View, Image, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors } from "../constants/theme";

interface AppLogoProps {
  variant?: "dark" | "white" | "badge";
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = "dark",
  width = 160,
  height,
  style,
}) => {
  // Logo aspect ratio: 962 / 318 ≈ 3.025
  const calculatedHeight = height ?? Math.round(width / 3.025);

  if (variant === "badge") {
    const badgeSize = Math.max(width, calculatedHeight) + 24;
    return (
      <View
        style={[
          styles.badgeContainer,
          { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 },
          style,
        ]}
      >
        <Image
          source={require("../../assets/logo-white.png")}
          style={{ width: width * 0.75, height: (width * 0.75) / 3.025 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  const imageSource =
    variant === "white"
      ? require("../../assets/logo-white.png")
      : require("../../assets/logo.png");

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={{ width, height: calculatedHeight }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  badgeContainer: {
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default AppLogo;
