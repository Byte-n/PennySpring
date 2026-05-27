import type { ComponentSize } from '../shares/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import { AvatarRoot } from './Avatar';
import type {
  AliasToken } from '@pennyspring/theme';
import type { TextStyle,
  ViewStyle } from 'react-native';
import type { AvatarGroupProps,
} from './types';

const DEFAULT_MAX_COUNT = 3;

interface AvatarGroupStyleOptions {
  size: ComponentSize;
}

interface AvatarGroupSizeConfig {
  overlap: (token: AliasToken) => number;
  restDimension: (token: AliasToken) => number;
  restPaddingHorizontal: (token: AliasToken) => number;
  restFontSize: (token: AliasToken) => number;
  restLineHeight: (token: AliasToken) => number;
}

const AVATAR_GROUP_SIZE_CONFIG: Record<ComponentSize, AvatarGroupSizeConfig> = {
  small: {
    overlap: token => token.paddingXXS,
    restDimension: token => token.controlHeightSM,
    restPaddingHorizontal: token => token.paddingXXS,
    restFontSize: token => token.fontSizeSM,
    restLineHeight: token => token.lineHeightSM,
  },
  normal: {
    overlap: token => token.paddingXS,
    restDimension: token => token.controlHeight,
    restPaddingHorizontal: token => token.paddingXS,
    restFontSize: token => token.fontSize,
    restLineHeight: token => token.lineHeight,
  },
  large: {
    overlap: token => token.paddingSM,
    restDimension: token => token.controlHeightLG,
    restPaddingHorizontal: token => token.paddingSM,
    restFontSize: token => token.fontSizeLG,
    restLineHeight: token => token.lineHeightLG,
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
  const sizeConfig = AVATAR_GROUP_SIZE_CONFIG[size];
  const overlap = sizeConfig.overlap(token);
  const restDimension = sizeConfig.restDimension(token);

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
      borderRadius: restDimension,
      borderWidth: token.lineWidth,
      height: restDimension,
      justifyContent: 'center',
      marginLeft: -overlap,
      minWidth: restDimension,
      paddingHorizontal: sizeConfig.restPaddingHorizontal(token),
    },
    restText: {
      color: token.colorTextSecondary,
      fontFamily: token.fontFamily,
      fontSize: sizeConfig.restFontSize(token),
      fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      lineHeight: sizeConfig.restLineHeight(token),
    },
  };
});

function resolveAvatarGroupSize(size?: ComponentSize): ComponentSize {
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
