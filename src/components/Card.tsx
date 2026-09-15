import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
    };

    switch (variant) {
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border;
        break;
      case 'elevated':
        Object.assign(baseStyle, shadows.medium);
        break;
      default:
        Object.assign(baseStyle, shadows.small);
    }

    switch (padding) {
      case 'none':
        baseStyle.padding = 0;
        break;
      case 'small':
        baseStyle.padding = spacing.sm;
        break;
      case 'large':
        baseStyle.padding = spacing.lg;
        break;
      default:
        baseStyle.padding = spacing.md;
    }

    return baseStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
}
