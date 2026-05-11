import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type {
  DividerDirection,
  DividerProps,
  DividerSize,
} from './types';

interface DividerStyleOptions {
  direction: DividerDirection;
  size: DividerSize;
}

interface DividerSizeStyleConfig {
  contentPaddingHorizontal: (token: AliasToken) => number;
  marginHorizontal: (token: AliasToken) => number;
  marginVertical: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<DividerSize, DividerSizeStyleConfig> = {
  small: {
    contentPaddingHorizontal: token => token.paddingXS,
    marginHorizontal: token => token.marginXS,
    marginVertical: token => token.marginXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    contentPaddingHorizontal: token => token.paddingMD,
    marginHorizontal: token => token.marginMD,
    marginVertical: token => token.marginMD,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  large: {
    contentPaddingHorizontal: token => token.paddingLG,
    marginHorizontal: token => token.marginLG,
    marginVertical: token => token.marginLG,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
};

const CONTENT_LINE_MAX_WIDTH: `${number}%` = '10%';

const useStyles = createUseSheetStyle(
  (token, options: DividerStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[options.size];
    const isHorizontal = options.direction === 'horizontal';

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
      line: {
        borderTopColor: token.colorSplit,
        borderTopWidth: isHorizontal ? token.lineWidth : 0,
        flexGrow: isHorizontal ? 1 : 0,
      },
      contentContainer: {
        paddingHorizontal: isHorizontal
          ? sizeConfig.contentPaddingHorizontal(token)
          : 0,
      },
      contentText: {
        color: token.colorTextDescription,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
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
    direction,
    size,
  });
  const firstLineStyle = [
    tokenStyles.line,
    shouldRenderContent && contentPosition === 'left'
      ? { maxWidth: CONTENT_LINE_MAX_WIDTH }
      : null,
    styles?.line,
  ];
  const secondLineStyle = [
    tokenStyles.line,
    shouldRenderContent && contentPosition === 'right'
      ? { maxWidth: CONTENT_LINE_MAX_WIDTH }
      : null,
    styles?.line,
  ];

  if (direction === 'vertical') {
    return <View style={[tokenStyles.root, style]} />;
  }

  return (
    <View style={[tokenStyles.root, style]}>
      <View style={firstLineStyle} />
      {shouldRenderContent ? (
        <View style={tokenStyles.contentContainer}>
          {typeof children === 'string' || typeof children === 'number' ? (
            <Text style={[tokenStyles.contentText, styles?.content]}>{children}</Text>
          ) : (
            renderContent(children)
          )}
        </View>
      ) : null}
      <View style={secondLineStyle} />
    </View>
  );
}
