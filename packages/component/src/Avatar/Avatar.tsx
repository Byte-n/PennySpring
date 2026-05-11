import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { ImageSourcePropType, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type { AvatarProps, AvatarShape, AvatarSize } from './types';

export type AvatarDisplayType = 'image' | 'text' | 'icon' | 'empty';

interface AvatarStyleOptions {
  shape: AvatarShape;
  size: AvatarSize;
}

interface AvatarSizeConfig {
  dimension: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const AVATAR_SIZE_CONFIG: Record<AvatarSize, AvatarSizeConfig> = {
  small: {
    dimension: token => token.controlHeightSM,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    dimension: token => token.controlHeight,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    dimension: token => token.controlHeightLG,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

interface AvatarStyleSheet {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
  root: ViewStyle;
  image: ImageStyle;
  text: TextStyle;
  icon: ViewStyle;
  rootDisabled: ViewStyle;
}

const useStyles = createUseSheetStyle<AvatarStyleOptions, AvatarStyleSheet>(
  (token, { shape, size }: AvatarStyleOptions) => {
    const sizeConfig = AVATAR_SIZE_CONFIG[size];
    const dimension = sizeConfig.dimension(token);
    const borderRadius = shape === 'circle' ? dimension : token.borderRadius;

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
      text: {
        color: token.colorText,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
        lineHeight: sizeConfig.lineHeight(token),
      },
      icon: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      rootDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
        opacity: token.opacityLoading,
      },
    };
  },
);

function resolveAvatarSize(size?: AvatarSize): AvatarSize {
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
  const [hasImageError, setHasImageError] = useState(false);
  const displayType = resolveAvatarDisplayType(
    src,
    text,
    icon,
    hasImageError,
  );

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
      {displayType === 'image' ? (
        <Image
          source={src}
          style={[tokenStyles.image, styles?.image]}
          onError={handleImageError}
        />
      ) : null}
      {displayType === 'text' ? (
        <Text style={[tokenStyles.text, styles?.text]}>
          {formatAvatarText(text ?? '')}
        </Text>
      ) : null}
      {displayType === 'icon' ? (
        <View style={[tokenStyles.icon, styles?.icon]}>{icon}</View>
      ) : null}
    </View>
  );
}
