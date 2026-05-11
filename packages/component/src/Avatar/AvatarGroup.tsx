import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import { AvatarRoot } from './Avatar';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle, ViewStyle } from 'react-native';
import type { AvatarGroupProps, AvatarSize } from './types';

const DEFAULT_MAX_COUNT = 3;

interface AvatarGroupStyleOptions {
  size: AvatarSize;
}

interface AvatarGroupSizeConfig {
  overlap: (token: AliasToken) => number;
}

const AVATAR_GROUP_SIZE_CONFIG: Record<AvatarSize, AvatarGroupSizeConfig> = {
  small: {
    overlap: token => token.paddingXXS,
  },
  normal: {
    overlap: token => token.paddingXS,
  },
  large: {
    overlap: token => token.paddingSM,
  },
};

interface AvatarGroupStyleSheet {
  [key: string]: ViewStyle | TextStyle;
  root: ViewStyle;
  item: ViewStyle;
  firstItem: ViewStyle;
  rest: ViewStyle;
  restText: TextStyle;
}

const useStyles = createUseSheetStyle<
  AvatarGroupStyleOptions,
  AvatarGroupStyleSheet
>((token, { size }: AvatarGroupStyleOptions) => {
  const overlap = AVATAR_GROUP_SIZE_CONFIG[size].overlap(token);

  return {
    root: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    item: {
      marginLeft: -overlap,
    },
    firstItem: {
      marginLeft: 0,
    },
    rest: {
      alignItems: 'center',
      backgroundColor: token.colorFillTertiary,
      borderColor: token.colorBgContainer,
      borderRadius: token.controlHeight,
      borderWidth: token.lineWidth,
      height: token.controlHeight,
      justifyContent: 'center',
      marginLeft: -overlap,
      minWidth: token.controlHeight,
      paddingHorizontal: token.paddingXS,
    },
    restText: {
      color: token.colorTextSecondary,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeSM,
      fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      lineHeight: token.lineHeightSM,
    },
  };
});

function resolveAvatarGroupSize(size?: AvatarSize): AvatarSize {
  return size ?? 'normal';
}

export function resolveAvatarGroupMaxCount(maxCount: number | undefined): number {
  if (
    maxCount === undefined ||
    !Number.isFinite(maxCount) ||
    !Number.isInteger(maxCount) ||
    maxCount <= 0
  ) {
    return DEFAULT_MAX_COUNT;
  }

  return maxCount;
}

export function AvatarGroup({
  items = [],
  maxCount,
  size,
  style,
  styles,
}: AvatarGroupProps) {
  const resolvedSize = resolveAvatarGroupSize(size);
  const resolvedMaxCount = resolveAvatarGroupMaxCount(maxCount);
  const tokenStyles = useStyles({ size: resolvedSize });
  const visibleItems = items.slice(0, resolvedMaxCount);
  const restCount = Math.max(0, items.length - visibleItems.length);

  return (
    <View style={[tokenStyles.root, style]}>
      {visibleItems.map((item, index) => {
        const { key, size: itemSize, ...avatarProps } = item;

        return (
          <View
            key={key}
            style={[
              tokenStyles.item,
              index === 0 ? tokenStyles.firstItem : undefined,
              styles?.item,
            ]}
          >
            <AvatarRoot {...avatarProps} size={itemSize ?? resolvedSize} />
          </View>
        );
      })}
      {restCount > 0 ? (
        <View style={[tokenStyles.rest, styles?.rest]}>
          <Text style={[tokenStyles.restText, styles?.restText]}>
            {`+${restCount}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
