import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../constants/theme';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
}

export default function Loading({
  size = 'large',
  color = colors.primary[600],
  text,
  fullScreen = false,
  overlay = false,
  style,
}: LoadingProps) {
  const content = (
    <View style={[styles.content, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, overlay && styles.overlay]}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
