import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'secondary': return colors.secondary[100]  || `${colors.secondary[500]}20`;
      case 'success':   return colors.success[100];
      case 'warning':   return colors.warning[100];
      case 'error':     return colors.error[100];
      case 'info':      return colors.info[100];
      default:          return colors.primaryLight;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'secondary': return colors.secondary[600];
      case 'success':   return colors.success[700];
      case 'warning':   return colors.warning[700];
      case 'error':     return colors.error[600];
      case 'info':      return colors.info[700];
      default:          return colors.primary[700] as string;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          paddingHorizontal: size === 'small' ? spacing.xs : spacing.sm,
          paddingVertical: size === 'small' ? 2 : spacing.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          size === 'small' ? styles.textSmall : styles.text,
          { color: getTextColor() },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
