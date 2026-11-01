import type { ComponentSize } from '../shares/types';
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
import { toNativeImageSource } from '../shares/imageSource';
import type { ReactNode } from 'react';
import type {
  ImageSourcePropType,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type { AvatarProps, AvatarShape } from './types';
import type { TextSize } from '../Text';

export type AvatarDisplayType = 'image' | 'text' | 'icon' | 'empty';

interface AvatarStyleOptions {
  shape: AvatarShape;
  size: ComponentSize;
}

interface AvatarSizeConfig {
  dimension: number;
  textSize: TextSize;
  iconSize: number;
  squareRadius: (token: AliasToken) => number;
}

/** AliasToken 没有头像档位；28 / 40 / 56 落在 4px 网格，方角对齐小/中/大卡。 */
const AVATAR_SMALL = 28;
const AVATAR_NORMAL = 40;
const AVATAR_LARGE = 56;
const PILL_RADIUS = 999;

export const AVATAR_SIZE_CONFIG: Record<ComponentSize, AvatarSizeConfig> = {
  small: {
    dimension: AVATAR_SMALL,
    textSize: 'xs',
    iconSize: 16,
    squareRadius: token => token.borderRadiusSM,
  },
  normal: {
    dimension: AVATAR_NORMAL,
    textSize: 'sm',
    iconSize: 20,
    squareRadius: token => token.borderRadius,
  },
  large: {
    dimension: AVATAR_LARGE,
    textSize: 'lg',
    iconSize: 26,
    squareRadius: token => token.borderRadiusLG,
  },
};

interface AvatarStyleSheet {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
  root: ViewStyle;
  image: ImageStyle;
  icon: ViewStyle;
  rootDisabled: ViewStyle;
}

const useStyles = createUseSheetStyle<AvatarStyleOptions, AvatarStyleSheet>(
  (token, { shape, size }: AvatarStyleOptions) => {
    const sizeConfig = AVATAR_SIZE_CONFIG[size];
    const dimension = sizeConfig.dimension;
    const borderRadius =
      shape === 'circle' ? PILL_RADIUS : sizeConfig.squareRadius(token);

    return {
      root: {
        alignItems: 'center',
        backgroundColor: token.colorFillSecondary,
        borderRadius,
        height: dimension,
        justifyContent: 'center',
        overflow: 'hidden',
        width: dimension,
      },
      image: {
        height: '100%',
        width: '100%',
      },
      icon: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      rootDisabled: {
        backgroundColor: token.colorFillQuaternary,
        opacity: token.opacityLoading,
      },
    };
  },
);

function resolveAvatarSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

export function resolveAvatarDisplayType(
  src: ImageSourcePropType | undefined,
  text: string | undefined,
  icon: ReactNode | undefined,
  hasImageError: boolean,
): AvatarDisplayType {
  if (src !== undefined && !hasImageError) {
    return 'image';
  }

  if (formatAvatarText(text ?? '') !== '') {
    return 'text';
  }

  if (icon !== undefined && icon !== null) {
    return 'icon';
  }

  return 'empty';
}

export function formatAvatarText(text: string): string {
  return text.trim().charAt(0);
}

export function AvatarRoot({
  disabled = false,
  icon,
  onError,
  shape = 'circle',
  size,
  src,
  style,
  styles,
  text,
}: AvatarProps) {
  const resolvedSize = resolveAvatarSize(size);
  const tokenStyles = useStyles({ shape, size: resolvedSize });
  const sizeConfig = AVATAR_SIZE_CONFIG[resolvedSize];
  const [hasImageError, setHasImageError] = useState(false);
  const displayType = resolveAvatarDisplayType(src, text, icon, hasImageError);

  useEffect(() => {
    setHasImageError(false);
  }, [src]);

  function handleImageError(): void {
    setHasImageError(true);
    onError?.();
  }

  return (
    <View
      style={[
        tokenStyles.root,
        disabled ? tokenStyles.rootDisabled : undefined,
        style,
      ]}
    >
      {displayType === 'image' && src !== undefined ? (
        <Image
          source={toNativeImageSource(src)}
          style={[tokenStyles.image, styles?.image]}
          onError={handleImageError}
        />
      ) : null}
      {displayType === 'text' ? (
        <Text
          color="secondary"
          size={sizeConfig.textSize}
          weight="semibold"
          style={styles?.text}
        >
          {formatAvatarText(text ?? '')}
        </Text>
      ) : null}
      {displayType === 'icon' ? (
        <View style={[tokenStyles.icon, styles?.icon]}>
          {renderTextNode(icon, value => (
            <Text>{value}</Text>
          ))}
        </View>
      ) : null}
      {displayType === 'empty' ? (
        <Icon
          color="quaternary"
          icon="user"
          size={sizeConfig.iconSize}
          style={[tokenStyles.icon, styles?.icon]}
        />
      ) : null}
    </View>
  );
}
