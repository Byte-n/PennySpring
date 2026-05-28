import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

export interface StepsStyleOptions {
  size: ComponentSize;
}

interface SizeStyleConfig {
  indicatorSize: (token: AliasToken) => number;
  indicatorFontSize: (token: AliasToken) => number;
  indicatorLineHeight: (token: AliasToken) => number;
  titleFontSize: (token: AliasToken) => number;
  titleLineHeight: (token: AliasToken) => number;
  descriptionFontSize: (token: AliasToken) => number;
  descriptionLineHeight: (token: AliasToken) => number;
  itemGap: (token: AliasToken) => number;
  contentGap: (token: AliasToken) => number;
  connectorHeight: (token: AliasToken) => number;
  connectorMarginTop: (token: AliasToken) => number;
}

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    indicatorSize: token => token.controlHeightSM,
    indicatorFontSize: token => token.fontSizeSM,
    indicatorLineHeight: token => token.lineHeightSM,
    titleFontSize: token => token.fontSizeSM,
    titleLineHeight: token => token.lineHeightSM,
    descriptionFontSize: token => token.fontSizeSM,
    descriptionLineHeight: token => token.lineHeightSM,
    itemGap: token => token.marginXXS,
    contentGap: token => token.marginXXS,
    connectorHeight: token => token.controlHeightSM,
    connectorMarginTop: token => token.marginXS,
  },
  normal: {
    indicatorSize: token => token.controlHeight,
    indicatorFontSize: token => token.fontSize,
    indicatorLineHeight: token => token.lineHeight,
    titleFontSize: token => token.fontSize,
    titleLineHeight: token => token.lineHeight,
    descriptionFontSize: token => token.fontSizeSM,
    descriptionLineHeight: token => token.lineHeightSM,
    itemGap: token => token.marginXS,
    contentGap: token => token.marginXS,
    connectorHeight: token => token.controlHeight,
    connectorMarginTop: token => token.marginSM,
  },
  large: {
    indicatorSize: token => token.controlHeightLG,
    indicatorFontSize: token => token.fontSizeLG,
    indicatorLineHeight: token => token.lineHeightLG,
    titleFontSize: token => token.fontSizeLG,
    titleLineHeight: token => token.lineHeightLG,
    descriptionFontSize: token => token.fontSize,
    descriptionLineHeight: token => token.lineHeight,
    itemGap: token => token.marginSM,
    contentGap: token => token.marginSM,
    connectorHeight: token => token.controlHeightLG,
    connectorMarginTop: token => token.marginSM,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { size }: StepsStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const indicatorSize = sizeConfig.indicatorSize(token);

    return {
      root: {
        alignSelf: 'stretch',
        width: '100%',
      },
      item: {
        width: '100%',
      },
      itemPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      itemDisabled: {
        opacity: token.opacityLoading,
      },
      stepHeader: {
        width: indicatorSize,
      },
      indicator: {
        alignItems: 'center',
        borderRadius: indicatorSize,
        borderWidth: token.lineWidth,
        height: indicatorSize,
        justifyContent: 'center',
        width: indicatorSize,
      },
      indicatorWait: {
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
      },
      indicatorProcess: {
        backgroundColor: token.colorPrimary,
        borderColor: token.colorPrimary,
      },
      indicatorFinish: {
        backgroundColor: token.colorSuccess,
        borderColor: token.colorSuccess,
      },
      indicatorError: {
        backgroundColor: token.colorError,
        borderColor: token.colorError,
      },
      connector: {
        marginTop: sizeConfig.connectorMarginTop(token),
        width: token.lineWidth,
        minHeight: sizeConfig.connectorHeight(token),
        backgroundColor: token.colorBorderSecondary,
      },
      connectorFinish: {
        backgroundColor: token.colorSuccess,
      },
      content: {
        flex: 1,
        paddingBottom: sizeConfig.itemGap(token),
      },
      contentLast: {
        paddingBottom: 0,
      },
    };
  },
);
