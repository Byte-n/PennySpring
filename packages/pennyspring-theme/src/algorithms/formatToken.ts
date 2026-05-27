import type { MapToken, AliasToken, ShadowToken } from '../types';
import { getAlphaColor } from './getAlphaColor';

function getShadowToken(
  colorShadow: string,
  offsetX: number,
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
): ShadowToken {
  return {
    shadowColor: colorShadow,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
}

export function formatToken(mapToken: MapToken): AliasToken {
  const {
    colorFillSecondary,
    colorFillTertiary,
    colorFillQuaternary,
    colorFill,
    colorTextQuaternary,
    colorTextTertiary,
    colorTextSecondary,
    colorText,
    colorBorderSecondary,
    colorBgContainer,
    colorPrimaryBg,
    colorError,
    colorErrorBg,
    colorWarningBg,
    colorShadow,
    colorWhite,
    controlHeight,
    fontSizeSM,
    fontWeightLight,
    fontWeightRegular,
    fontWeightMedium,
    fontWeightSemiBold,
    fontWeightBold,
    lineWidth,
    sizeXXS,
    sizeXS,
    sizeSM,
    size,
    sizeMD,
    sizeLG,
    sizeXL,
    sizeXXL,
  } = mapToken;

  const colorFillContent = colorFillSecondary;
  // 对齐 antd：内容区悬停态使用 colorFill（更明显的按下反馈）
  const colorFillContentHover = colorFill;
  const colorFillAlter = colorFillQuaternary;
  const colorBgContainerDisabled = colorFillTertiary;
  const colorBgTextHover = colorFillSecondary;
  const colorBgTextActive = colorFill;

  const colorBorderBg = colorBgContainer;
  const colorSplit = getAlphaColor(colorBorderSecondary, colorBgContainer);

  const colorTextPlaceholder = colorTextQuaternary;
  const colorTextDisabled = colorTextQuaternary;
  const colorTextHeading = colorText;
  // 对齐 antd：标签文本使用二级色，降低视觉压迫（契合「温柔审视」调性）
  const colorTextLabel = colorTextSecondary;
  const colorTextDescription = colorTextTertiary;
  // 使用 mapToken 的 colorWhite，支持主题切换
  const colorTextLightSolid = colorWhite;
  // 使用 mapToken 的 colorError，支持主题切换
  const colorHighlight = colorError;

  const colorIcon = colorTextTertiary;
  const colorIconHover = colorText;

  // 移动端保留 *3，焦点环/轮廓更显眼（A11y）
  const controlOutlineWidth = lineWidth * 3;
  const controlOutline = getAlphaColor(colorPrimaryBg, colorBgContainer);
  const controlItemBgHover = colorFillTertiary;
  const controlItemBgActive = colorPrimaryBg;
  const controlItemBgActiveHover = colorFillSecondary;
  const controlItemBgActiveDisabled = colorFill;
  // 对齐 antd：随 controlHeight 动态派生，避免 seed 变更后脱节
  const controlInteractiveSize = controlHeight / 2;
  const controlPaddingHorizontal = sizeMD;
  const controlPaddingHorizontalSM = sizeSM;

  const colorErrorOutline = getAlphaColor(colorErrorBg, colorBgContainer);
  const colorWarningOutline = getAlphaColor(colorWarningBg, colorBgContainer);

  // 对齐 antd：图标字号归属字体梯度，不跟随 size 系统
  const fontSizeIcon = fontSizeSM;
  const fontWeightStrong = fontWeightSemiBold;
  const lineWidthFocus = lineWidth * 3;

  const paddingXXS = sizeXXS;
  const paddingXS = sizeXS;
  const paddingSM = sizeSM;
  const padding = size;
  const paddingMD = sizeMD;
  const paddingLG = sizeLG;
  const paddingXL = sizeXL;
  const paddingContentHorizontalLG = sizeLG;
  const paddingContentHorizontal = size;
  const paddingContentHorizontalSM = sizeSM;
  const paddingContentVerticalLG = paddingContentHorizontalLG / 2;
  const paddingContentVertical = paddingContentHorizontal / 2;
  const paddingContentVerticalSM = paddingContentHorizontalSM / 2;

  const marginXXS = sizeXXS;
  const marginXS = sizeXS;
  const marginSM = sizeSM;
  const margin = size;
  const marginMD = sizeMD;
  const marginLG = sizeLG;
  const marginXL = sizeXL;
  const marginXXL = sizeXXL;

  // RN iOS shadow 无 spread 扩散，渲染比 CSS 更硬且集中；
  // 从 ant-design 原值柔化为下列参数，更贴近 iOS 原生观感。
  const boxShadow = getShadowToken(colorShadow, 0, 4, 12, 0.06, 4);
  const boxShadowSecondary = getShadowToken(colorShadow, 0, 2, 8, 0.04, 3);
  const boxShadowTertiary = getShadowToken(colorShadow, 0, 1, 4, 0.02, 2);

  const motionDurationFast = mapToken.motion === false ? 0 : mapToken.motionDurationFast;
  const motionDurationMid = mapToken.motion === false ? 0 : mapToken.motionDurationMid;
  const motionDurationSlow = mapToken.motion === false ? 0 : mapToken.motionDurationSlow;

  return {
    ...mapToken,
    colorFillContent,
    colorFillContentHover,
    colorFillAlter,
    colorBgContainerDisabled,
    colorBgTextHover,
    colorBgTextActive,
    colorBorderBg,
    colorSplit,
    colorTextPlaceholder,
    colorTextDisabled,
    colorTextHeading,
    colorTextLabel,
    colorTextDescription,
    colorTextLightSolid,
    colorHighlight,
    colorIcon,
    colorIconHover,
    controlOutlineWidth,
    controlOutline,
    controlItemBgHover,
    controlItemBgActive,
    controlItemBgActiveHover,
    controlItemBgActiveDisabled,
    controlInteractiveSize,
    controlPaddingHorizontal,
    controlPaddingHorizontalSM,
    colorErrorOutline,
    colorWarningOutline,
    fontSizeIcon,
    fontWeightLight,
    fontWeightRegular,
    fontWeightMedium,
    fontWeightSemiBold,
    fontWeightBold,
    fontWeightStrong,
    lineWidthFocus,
    paddingXXS,
    paddingXS,
    paddingSM,
    padding,
    paddingMD,
    paddingLG,
    paddingXL,
    paddingContentHorizontalLG,
    paddingContentHorizontal,
    paddingContentHorizontalSM,
    paddingContentVerticalLG,
    paddingContentVertical,
    paddingContentVerticalSM,
    marginXXS,
    marginXS,
    marginSM,
    margin,
    marginMD,
    marginLG,
    marginXL,
    marginXXL,
    boxShadow,
    boxShadowSecondary,
    boxShadowTertiary,
    motionDurationFast,
    motionDurationMid,
    motionDurationSlow,
    opacityLoading: 0.65,
    // 使用 mapToken 的 colorFillQuaternary，支持主题切换
    controlTmpOutline: colorFillQuaternary,
  } as AliasToken;
}
