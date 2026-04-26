import { getAlphaColor } from './colorAlgorithm';
import { getSolidColor, getSolidColorDark } from './colorAlgorithm';
import type { ColorNeutralMapToken } from '../types';

export function generateNeutralColorPalettes(
  bgBaseColor: string,
  textBaseColor: string,
): ColorNeutralMapToken {
  const colorTextBase = textBaseColor || '#000';
  const colorBgBase = bgBaseColor || '#fff';
  const colorShadow = '#000';
  const colorBgBlur = 'transparent';

  const colorText = getAlphaColor(colorTextBase, 0.88);
  const colorTextSecondary = getAlphaColor(colorTextBase, 0.65);
  const colorTextTertiary = getAlphaColor(colorTextBase, 0.45);
  const colorTextQuaternary = getAlphaColor(colorTextBase, 0.25);

  const colorFill = getAlphaColor(colorTextBase, 0.15);
  const colorFillSecondary = getAlphaColor(colorTextBase, 0.06);
  const colorFillTertiary = getAlphaColor(colorTextBase, 0.04);
  const colorFillQuaternary = getAlphaColor(colorTextBase, 0.02);

  const colorBgSolid = getAlphaColor(colorTextBase, 1);
  const colorBgSolidHover = getAlphaColor(colorTextBase, 0.75);
  const colorBgSolidActive = getAlphaColor(colorTextBase, 0.95);

  const colorBgLayout = getSolidColor(colorBgBase, 4);
  const colorBgContainer = getSolidColor(colorBgBase, 0);
  const colorBgElevated = getSolidColor(colorBgBase, 0);
  const colorBgSpotlight = getAlphaColor(colorTextBase, 0.85);

  const colorBorder = getSolidColor(colorBgBase, 15);
  const colorBorderSecondary = getSolidColor(colorBgBase, 6);
  const colorBorderDisabled = getSolidColor(colorBgBase, 15);

  return {
    colorTextBase,
    colorBgBase,
    colorShadow,
    colorText,
    colorTextSecondary,
    colorTextTertiary,
    colorTextQuaternary,
    colorFill,
    colorFillSecondary,
    colorFillTertiary,
    colorFillQuaternary,
    colorBgLayout,
    colorBgContainer,
    colorBgElevated,
    colorBgSpotlight,
    colorBgBlur,
    colorBgSolid,
    colorBgSolidHover,
    colorBgSolidActive,
    colorBorder,
    colorBorderSecondary,
    colorBorderDisabled,
  };
}

export function generateNeutralColorPalettesDark(
  bgBaseColor: string,
  textBaseColor: string,
): ColorNeutralMapToken {
  const colorTextBase = textBaseColor || '#fff';
  const colorBgBase = bgBaseColor || '#000';
  const colorShadow = 'rgba(255, 255, 255, 0.2)';
  const colorBgBlur = getAlphaColor(colorTextBase, 0.04);

  const colorText = getAlphaColor(colorTextBase, 0.85);
  const colorTextSecondary = getAlphaColor(colorTextBase, 0.65);
  const colorTextTertiary = getAlphaColor(colorTextBase, 0.45);
  const colorTextQuaternary = getAlphaColor(colorTextBase, 0.25);

  const colorFill = getAlphaColor(colorTextBase, 0.18);
  const colorFillSecondary = getAlphaColor(colorTextBase, 0.12);
  const colorFillTertiary = getAlphaColor(colorTextBase, 0.08);
  const colorFillQuaternary = getAlphaColor(colorTextBase, 0.04);

  const colorBgSolid = getAlphaColor(colorTextBase, 0.95);
  const colorBgSolidHover = getAlphaColor(colorTextBase, 1);
  const colorBgSolidActive = getAlphaColor(colorTextBase, 0.9);

  const colorBgLayout = getSolidColorDark(colorBgBase, 0);
  const colorBgContainer = getSolidColorDark(colorBgBase, 8);
  const colorBgElevated = getSolidColorDark(colorBgBase, 12);
  const colorBgSpotlight = getSolidColorDark(colorBgBase, 26);

  const colorBorder = getSolidColorDark(colorBgBase, 26);
  const colorBorderSecondary = getSolidColorDark(colorBgBase, 19);
  const colorBorderDisabled = getSolidColorDark(colorBgBase, 26);

  return {
    colorTextBase,
    colorBgBase,
    colorShadow,
    colorText,
    colorTextSecondary,
    colorTextTertiary,
    colorTextQuaternary,
    colorFill,
    colorFillSecondary,
    colorFillTertiary,
    colorFillQuaternary,
    colorBgLayout,
    colorBgContainer,
    colorBgElevated,
    colorBgSpotlight,
    colorBgBlur,
    colorBgSolid,
    colorBgSolidHover,
    colorBgSolidActive,
    colorBorder,
    colorBorderSecondary,
    colorBorderDisabled,
  };
}
