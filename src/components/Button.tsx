import React from "react";
import {
  TouchableOpacity,
  Text,
  
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, spacing, borderRadius } from "../constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = "left",
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    };

    // Size styles
    switch (size) {
      case "small":
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
        break;
      case "large":
        baseStyle.paddingVertical = spacing.lg;
        baseStyle.paddingHorizontal = spacing.xl;
        break;
      default:
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.lg;
    }

    // Variant styles
    switch (variant) {
      case "secondary":
        baseStyle.backgroundColor = colors.secondary[600];
        break;
      case "outline":
        baseStyle.backgroundColor = "transparent";
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary[600];
        break;
      case "ghost":
        baseStyle.backgroundColor = "transparent";
        break;
      case "danger":
        baseStyle.backgroundColor = colors.error[600];
        break;
      default:
        baseStyle.backgroundColor = colors.primary[600];
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    if (fullWidth) {
      baseStyle.width = "100%";
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: "600",
    };

    // Size styles
    switch (size) {
      case "small":
        baseTextStyle.fontSize = 14;
        break;
      case "large":
        baseTextStyle.fontSize = 18;
        break;
      default:
        baseTextStyle.fontSize = 16;
    }

    // Variant styles
    switch (variant) {
      case "outline":
      case "ghost":
        baseTextStyle.color = colors.primary[600];
        break;
      default:
        baseTextStyle.color = colors.white;
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost"
              ? colors.primary[600]
              : colors.white
          }
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

export { Button };
export default Button;
