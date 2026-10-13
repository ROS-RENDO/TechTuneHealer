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
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: '#F1F5F9',
    };

    switch (variant) {
      case 'outlined':
        baseStyle.borderWidth = 1.5;
        baseStyle.borderColor = colors.border;
        break;
      case 'elevated':
        Object.assign(baseStyle, shadows.md);
        baseStyle.borderColor = 'rgba(0,0,0,0.04)';
        break;
      default:
        Object.assign(baseStyle, shadows.sm);
    }

    switch (padding) {
      case 'none':
        baseStyle.padding = 0;
        break;
      case 'small':
        baseStyle.padding = spacing.sm;
        break;
      case 'large':
        baseStyle.padding = spacing.xl;
        break;
      default:
        baseStyle.padding = spacing.lg;
    }

    return baseStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.74}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
}
