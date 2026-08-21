import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../shares/types';
import type { TextSize } from '../Text';

export interface FloatingPanelSizeConfig {
  actionGap: (token: AliasToken) => number;
  contentPadding: (token: AliasToken) => number;
  handleHeight: (token: AliasToken) => number;
  handleWidth: (token: AliasToken) => number;
  indicatorHeight: (token: AliasToken) => number;
  sectionMargin: (token: AliasToken) => number;
  sectionPadding: (token: AliasToken) => number;
  titleTextSize: TextSize;
}

const SIZE_MAP: Record<ComponentSize, FloatingPanelSizeConfig> = {
  small: {
    actionGap: token => token.marginXXS,
    contentPadding: token => token.paddingSM,
    handleHeight: token => token.controlHeightXS,
    handleWidth: token => token.controlHeightSM,
    indicatorHeight: token => token.lineWidthBold,
    sectionMargin: token => token.marginSM,
    sectionPadding: token => token.paddingSM,
    titleTextSize: 'md',
  },
  normal: {
    actionGap: token => token.marginXS,
    contentPadding: token => token.padding,
    handleHeight: token => token.controlHeightSM,
    handleWidth: token => token.controlHeight,
    indicatorHeight: token => token.sizeXXS,
    sectionMargin: token => token.margin,
    sectionPadding: token => token.padding,
    titleTextSize: 'lg',
  },
  large: {
    actionGap: token => token.marginSM,
    contentPadding: token => token.paddingMD,
    handleHeight: token => token.controlHeight,
    handleWidth: token => token.controlHeightLG,
    indicatorHeight: token => token.sizeXS,
    sectionMargin: token => token.marginMD,
    sectionPadding: token => token.paddingMD,
    titleTextSize: 'xl',
  },
};

export function getFloatingPanelSizeConfig(
  size: ComponentSize,
): FloatingPanelSizeConfig {
  return SIZE_MAP[size];
}
