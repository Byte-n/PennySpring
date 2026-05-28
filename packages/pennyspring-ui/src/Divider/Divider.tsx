import type { ComponentSize } from '../shares/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type {
  AliasToken } from '@pennyspring/theme';
import type {
  DividerContentPosition,
  DividerDirection,
  DividerProps,
} from './types';

interface DividerStyleOptions {
  contentPosition: DividerContentPosition;
  direction: DividerDirection;
  hasContent: boolean;
  size: ComponentSize;
}

type ContentLinePosition = DividerContentPosition | 'none';

interface DividerSizeStyleConfig {
  contentPaddingHorizontal: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
  marginHorizontal: (token: AliasToken) => number;
  marginVertical: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, DividerSizeStyleConfig> = {
  small: {
    contentPaddingHorizontal: token => token.paddingXS,
    lineHeight: token => token.lineHeightSM,
    marginHorizontal: token => token.marginSM,
    marginVertical: token => token.marginSM / 2,
  },
  normal: {
    contentPaddingHorizontal: token => token.paddingMD,
    lineHeight: token => token.lineHeightSM,
    marginHorizontal: token => token.margin,
    marginVertical: token => token.margin / 2,
  },
  large: {
    contentPaddingHorizontal: token => token.paddingLG,
    lineHeight: token => token.lineHeight,
    marginHorizontal: token => token.marginMD,
    marginVertical: token => token.marginMD / 2,
  },
};

const useStyles = createUseSheetStyle(
  (token, options: DividerStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[options.size];
    const isHorizontal = options.direction === 'horizontal';
    const contentLinePosition: ContentLinePosition = options.hasContent
      ? options.contentPosition
      : 'none';
    const startLineFlexGrow =
      contentLinePosition === 'left' ? 0 : 1;
    const endLineFlexGrow =
      contentLinePosition === 'right' ? 0 : 1;

    return {
      root: {
        alignItems: isHorizontal ? 'center' : undefined,
        alignSelf: isHorizontal ? 'stretch' : undefined,
        borderLeftColor: token.colorSplit,
        borderLeftWidth: isHorizontal ? 0 : token.lineWidth,
        flexDirection: isHorizontal ? 'row' : undefined,
        height: isHorizontal ? undefined : sizeConfig.lineHeight(token),
        marginHorizontal: isHorizontal ? 0 : sizeConfig.marginHorizontal(token),
        marginVertical: isHorizontal ? sizeConfig.marginVertical(token) : 0,
      },
      firstLine: {
        borderTopColor: token.colorSplit,
        borderTopWidth: isHorizontal ? token.lineWidth : 0,
        flexGrow: isHorizontal ? startLineFlexGrow : 0,
      },
      secondLine: {
        borderTopColor: token.colorSplit,
        borderTopWidth: isHorizontal ? token.lineWidth : 0,
        flexGrow: isHorizontal ? endLineFlexGrow : 0,
      },
      contentContainer: {
        paddingHorizontal: isHorizontal
          ? sizeConfig.contentPaddingHorizontal(token)
          : 0,
      },
    };
  },
);

function hasContent(children: DividerProps['children']) {
  return children !== undefined && children !== null && children !== false;
}

function renderContent(children: DividerProps['children']) {
  return children;
}

export function Divider({
  children,
  contentPosition = 'center',
  direction = 'horizontal',
  size = 'normal',
  style,
  styles,
}: DividerProps) {
  const shouldRenderContent = hasContent(children);
  const tokenStyles = useStyles({
    contentPosition,
    direction,
    hasContent: shouldRenderContent,
    size,
  });
  const firstLineStyle = [tokenStyles.firstLine, styles?.line];
  const secondLineStyle = [tokenStyles.secondLine, styles?.line];

  if (direction === 'vertical') {
    return <View style={[tokenStyles.root, style]} />;
  }

  return (
    <View style={[tokenStyles.root, style]}>
      <View style={firstLineStyle} />
      {shouldRenderContent ? (
        <View style={tokenStyles.contentContainer}>
          {typeof children === 'string' || typeof children === 'number' ? (
            <Text color="description" size={size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'} style={[styles?.content]}>
              {children}
            </Text>
          ) : (
            renderContent(children)
          )}
        </View>
      ) : null}
      <View style={secondLineStyle} />
    </View>
  );
}
