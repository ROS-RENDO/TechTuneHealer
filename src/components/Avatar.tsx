import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors } from '../constants/theme';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ImageStyle | ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
}

export default function Avatar({
  source,
  name = '',
  size = 'medium',
  style,
  showBadge = false,
  badgeColor = colors.success[500] as string,
}: AvatarProps) {
  const getSize = (): number => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      case 'xlarge':
        return 96;
      default:
        return 48;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 24;
      case 'xlarge':
        return 36;
      default:
        return 18;
    }
  };

  const getBadgeSize = (): number => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 16;
      case 'xlarge':
        return 20;
      default:
        return 12;
    }
  };

  const avatarSize = getSize();
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        style,
      ]}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: getFontSize() }]}>{initials}</Text>
        </View>
      )}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: getBadgeSize(),
              height: getBadgeSize(),
              borderRadius: getBadgeSize() / 2,
              backgroundColor: badgeColor,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.primary[600] as string,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
