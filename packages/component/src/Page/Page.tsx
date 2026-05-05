import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { useComponentConfig } from '../ConfigProvider';
import type { StyleProp, TextStyle } from 'react-native';
import type { PageProps } from './types';

const HEADER_SIDE_WIDTH_MULTIPLIER = 2;

const useStyles = createUseSheetStyle((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.paddingMD,
  },
  side: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: token.controlHeightSM,
    width: token.controlHeightSM * HEADER_SIDE_WIDTH_MULTIPLIER,
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: token.controlHeightSM,
    minWidth: token.controlHeightSM,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: token.colorTextHeading,
    fontFamily: token.fontFamily,
    fontSize: token.fontSizeLG,
    fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
    lineHeight: token.lineHeightLG,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
}));

function renderTitle(
  title: React.ReactNode,
  tokenTitleStyle: StyleProp<TextStyle>,
  titleStyle: PageProps['styles'],
) {
  if (typeof title === 'string') {
    return <Text style={[tokenTitleStyle, titleStyle?.title]}>{title}</Text>;
  }

  return title;
}

export function Page({
  backButtonIcon,
  children,
  onBack,
  right,
  styles,
  title,
}: PageProps) {
  const tokenStyles = useStyles();
  const { token } = useTheme();
  const componentConfig = useComponentConfig();
  const resolvedOnBack = onBack ?? componentConfig.page?.onBack;
  const shouldRenderBackButton =
    backButtonIcon !== undefined || resolvedOnBack !== undefined;
  const resolvedBackButtonIcon = backButtonIcon ?? (
    <ArrowLeftIcon
      color={token.colorIconHover}
      size={token.fontSizeHeading3}
      weight="bold"
    />
  );

  return (
    <View style={[tokenStyles.container, styles?.container]}>
      <View style={[tokenStyles.header, styles?.header]}>
        <View style={[tokenStyles.side, tokenStyles.left, styles?.left]}>
          {shouldRenderBackButton ? (
            <Pressable
              accessibilityLabel="返回"
              accessibilityRole="button"
              onPress={resolvedOnBack}
              style={tokenStyles.backButton}
            >
              {resolvedBackButtonIcon}
            </Pressable>
          ) : null}
        </View>
        <View style={tokenStyles.titleContainer}>
          {renderTitle(title, tokenStyles.title, styles)}
        </View>
        <View style={[tokenStyles.side, tokenStyles.right, styles?.right]}>{right}</View>
      </View>
      <View style={[tokenStyles.content, styles?.content]}>{children}</View>
    </View>
  );
}
