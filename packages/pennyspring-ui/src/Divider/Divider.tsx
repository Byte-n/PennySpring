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
  marginVertical: (token: AliasToken) => number;
  verticalHeight: (token: AliasToken) => number;
  verticalMarginHorizontal: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, DividerSizeStyleConfig> = {
  small: {
    marginVertical: token => token.paddingSM,
    verticalHeight: token => token.padding,
    verticalMarginHorizontal: token => token.paddingXS,
  },
  normal: {
    marginVertical: token => token.padding,
    verticalHeight: token => token.paddingMD,
    verticalMarginHorizontal: token => token.paddingSM,
  },
  large: {
    marginVertical: token => token.paddingMD,
    verticalHeight: token => token.paddingLG,
    verticalMarginHorizontal: token => token.padding,
  },
};

const useStyles = createUseSheetStyle(
  (token, options: DividerStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[options.size];
    const isHorizontal = options.direction === 'horizontal';
    const contentLinePosition: ContentLinePosition = options.hasContent
      ? options.contentPosition
      : 'none';
    const isStartLineShort = contentLinePosition === 'left';
    const isEndLineShort = contentLinePosition === 'right';

    return {
      root: {
        alignItems: isHorizontal ? 'center' : undefined,
        alignSelf: isHorizontal ? 'stretch' : undefined,
        borderLeftColor: token.colorSplit,
        borderLeftWidth: isHorizontal ? 0 : token.lineWidth,
        flexDirection: isHorizontal ? 'row' : undefined,
        height: isHorizontal ? undefined : sizeConfig.verticalHeight(token),
        marginHorizontal: isHorizontal
          ? 0
          : sizeConfig.verticalMarginHorizontal(token),
        marginVertical: isHorizontal ? sizeConfig.marginVertical(token) : 0,
      },
      firstLine: {
        borderTopColor: token.colorSplit,
        borderTopWidth: isHorizontal ? token.lineWidth : 0,
        flexGrow: isHorizontal && !isStartLineShort ? 1 : 0,
        width: isStartLineShort ? token.sizeLG : undefined,
      },
      secondLine: {
        borderTopColor: token.colorSplit,
        borderTopWidth: isHorizontal ? token.lineWidth : 0,
        flexGrow: isHorizontal && !isEndLineShort ? 1 : 0,
        width: isEndLineShort ? token.sizeLG : undefined,
      },
      contentContainer: {
        paddingHorizontal: isHorizontal ? token.paddingSM : 0,
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
            <Text color="tertiary" size="xs" style={[styles?.content]}>
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
