import type { ComponentSize } from '../shares/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Row } from '../Row';
import { Text } from '../Text';
import { AvatarRoot, AVATAR_SIZE_CONFIG } from './Avatar';
import type { StyleProp, ViewStyle } from 'react-native';
import type { AvatarGroupProps,
  AvatarShape,
} from './types';

const DEFAULT_MAX_COUNT = 3;
const PILL_RADIUS = 999;

/** 重叠 = 头像直径的 25%，按 4px 网格取整；环固定 2px 容器色。 */
const AVATAR_GROUP_OVERLAP: Record<ComponentSize, number> = {
  small: 8,
  normal: 10,
  large: 14,
};

const AVATAR_GROUP_REST_PADDING: Record<ComponentSize, number> = {
  small: 6,
  normal: 8,
  large: 10,
};

interface AvatarGroupItemStyleOptions {
  isFirst: boolean;
  shape: AvatarShape;
  size: ComponentSize;
}

const useItemStyles = createUseSheetStyle(
  (token, { isFirst, shape, size }: AvatarGroupItemStyleOptions) => {
    const sizeConfig = AVATAR_SIZE_CONFIG[size];
    const squareRadius = sizeConfig.squareRadius(token) + token.lineWidthBold;

    return {
      frame: {
        borderColor: token.colorBgContainer,
        borderRadius: shape === 'circle' ? PILL_RADIUS : squareRadius,
        borderWidth: token.lineWidthBold,
        marginLeft: isFirst ? 0 : -AVATAR_GROUP_OVERLAP[size],
      },
    };
  },
);

const useRestStyles = createUseSheetStyle(
  (token, { size }: { size: ComponentSize }) => {
    const sizeConfig = AVATAR_SIZE_CONFIG[size];
    const dimension = sizeConfig.dimension;

    return {
      rest: {
        alignItems: 'center',
        backgroundColor: token.colorFillTertiary,
        borderRadius: PILL_RADIUS,
        height: dimension,
        justifyContent: 'center',
        minWidth: dimension,
        paddingHorizontal: AVATAR_GROUP_REST_PADDING[size],
      },
      restText: {
        textAlign: 'center',
      },
    };
  },
);

interface AvatarGroupFrameProps {
  children: React.ReactNode;
  isFirst: boolean;
  shape: AvatarShape;
  size: ComponentSize;
  style?: StyleProp<ViewStyle>;
}

function AvatarGroupFrame({
  children,
  isFirst,
  shape,
  size,
  style,
}: AvatarGroupFrameProps) {
  const tokenStyles = useItemStyles({ isFirst, shape, size });

  return <View style={[tokenStyles.frame, style]}>{children}</View>;
}

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
  const restStyles = useRestStyles({ size: resolvedSize });
  const visibleItems = items.slice(0, resolvedMaxCount);
  const restCount = Math.max(0, items.length - visibleItems.length);

  return (
    <Row style={style}>
      {visibleItems.map((item, index) => {
        const { key, size: itemSize, ...avatarProps } = item;
        const resolvedItemSize = itemSize ?? resolvedSize;

        return (
          <AvatarGroupFrame
            key={key}
            isFirst={index === 0}
            shape={avatarProps.shape ?? 'circle'}
            size={resolvedItemSize}
            style={styles?.item}
          >
            <AvatarRoot {...avatarProps} size={resolvedItemSize} />
          </AvatarGroupFrame>
        );
      })}
      {restCount > 0 ? (
        <AvatarGroupFrame
          isFirst={visibleItems.length === 0}
          shape="circle"
          size={resolvedSize}
        >
          <View style={[restStyles.rest, styles?.rest]}>
            <Text
              color="secondary"
              size={AVATAR_SIZE_CONFIG[resolvedSize].textSize}
              weight="semibold"
              style={[restStyles.restText, styles?.restText]}
            >
              {`+${restCount}`}
            </Text>
          </View>
        </AvatarGroupFrame>
      ) : null}
    </Row>
  );
}
