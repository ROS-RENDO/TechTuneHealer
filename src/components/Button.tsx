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
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "tonal";
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
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
    };

    // Strict Apple HIG compliant minimum heights and comfortable horizontal padding
    switch (size) {
      case "small":
        baseStyle.minHeight = 44;
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
        baseStyle.borderRadius = borderRadius.md;
        break;
      case "large":
        baseStyle.minHeight = 56;
        baseStyle.paddingVertical = spacing.lg;
        baseStyle.paddingHorizontal = spacing.xl;
        baseStyle.borderRadius = borderRadius.xl;
        break;
      default:
        baseStyle.minHeight = 48;
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.lg;
        baseStyle.borderRadius = borderRadius.lg;
    }

    // High-taste color variants
    switch (variant) {
      case "secondary":
        baseStyle.backgroundColor = colors.secondary[600];
        break;
      case "tonal":
        baseStyle.backgroundColor = colors.primary[50];
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary[100];
        break;
      case "outline":
        baseStyle.backgroundColor = "transparent";
        baseStyle.borderWidth = 1.5;
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
        // Apple-style subtle drop shadow for primary call-to-action
        baseStyle.shadowColor = colors.primary[600];
        baseStyle.shadowOffset = { width: 0, height: 3 };
        baseStyle.shadowOpacity = 0.22;
        baseStyle.shadowRadius = 6;
        baseStyle.elevation = 3;
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.55;
      baseStyle.shadowOpacity = 0;
      baseStyle.elevation = 0;
    }

    if (fullWidth) {
      baseStyle.width = "100%";
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: "700",
      letterSpacing: -0.2,
    };

    // Typographic sizing
    switch (size) {
      case "small":
        baseTextStyle.fontSize = 14;
        break;
      case "large":
        baseTextStyle.fontSize = 17;
        break;
      default:
        baseTextStyle.fontSize = 15;
    }

    // Variant colors
    switch (variant) {
      case "tonal":
        baseTextStyle.color = colors.primary[700];
        break;
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
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" || variant === "tonal"
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
