import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants/theme';

interface RatingProps {
  value: number;
  maxValue?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  style?: ViewStyle;
}

export default function Rating({
  value,
  maxValue = 5,
  size = 'medium',
  showValue = false,
  showCount = false,
  count = 0,
  interactive = false,
  onRatingChange,
  style,
}: RatingProps) {
  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 24;
      default:
        return 18;
    }
  };

  const renderStar = (index: number) => {
    const filled = index < value;
    const halfFilled = !filled && index < value + 0.5;

    const iconName = filled
      ? 'star'
      : halfFilled
      ? 'star-half'
      : 'star-outline';

    const StarComponent = interactive ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={interactive ? () => onRatingChange?.(index + 1) : undefined}
        style={styles.star}
      >
        <Ionicons
          name={iconName}
          size={getIconSize()}
          color={filled || halfFilled ? colors.accent : colors.border}
        />
      </StarComponent>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxValue }, (_, i) => renderStar(i))}
      </View>
      {showValue && (
        <Text
          style={[
            styles.valueText,
            size === 'small' && styles.valueTextSmall,
            size === 'large' && styles.valueTextLarge,
          ]}
        >
          {value.toFixed(1)}
        </Text>
      )}
      {showCount && count > 0 && (
        <Text style={styles.countText}>({count})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    padding: 2,
  },
  valueText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  valueTextSmall: {
    fontSize: 12,
  },
  valueTextLarge: {
    fontSize: 18,
  },
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
