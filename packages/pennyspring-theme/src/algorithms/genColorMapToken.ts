import { FastColor } from '@ant-design/fast-color';
import type { SeedToken, ColorMapToken, ColorNeutralMapToken } from '../types';
import { PresetColors } from '../presetColors';

interface ColorPaletteGenerators {
  generateColorPalettes: (baseColor: string) => string[];
  generateNeutralColorPalettes: (
    bgBase: string,
    textBase: string,
  ) => ColorNeutralMapToken;
}

function mapPaletteToSemantic(
  colors: string[],
  prefix: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  result[`${prefix}Bg`] = colors[0];
  result[`${prefix}BgHover`] = colors[1];
  result[`${prefix}Border`] = colors[2];
  result[`${prefix}BorderHover`] = colors[3];
  result[`${prefix}Hover`] = colors[4];
  result[prefix] = colors[5];
  result[`${prefix}Active`] = colors[6];
  result[`${prefix}TextHover`] = colors[7];
  result[`${prefix}Text`] = colors[8];
  result[`${prefix}TextActive`] = colors[9];
  return result;
}

export function genColorMapToken(
  seed: SeedToken,
  generators: ColorPaletteGenerators,
): ColorMapToken {
  const { generateColorPalettes, generateNeutralColorPalettes } = generators;

  const primaryColors = generateColorPalettes(seed.colorPrimary);
  const successColors = generateColorPalettes(seed.colorSuccess);
  const warningColors = generateColorPalettes(seed.colorWarning);
  const errorColors = generateColorPalettes(seed.colorError);
  const infoColors = generateColorPalettes(seed.colorInfo);
  const linkBase = seed.colorLink || seed.colorInfo;
  const linkColors = generateColorPalettes(linkBase);

  const colorBgBase = seed.colorBgBase;
  const colorTextBase = seed.colorTextBase;
  const neutrals = generateNeutralColorPalettes(colorBgBase, colorTextBase);

  const result: Record<string, string> = {};

  Object.assign(result, mapPaletteToSemantic(primaryColors, 'colorPrimary'));
  Object.assign(result, mapPaletteToSemantic(successColors, 'colorSuccess'));
  Object.assign(result, mapPaletteToSemantic(warningColors, 'colorWarning'));
  Object.assign(result, mapPaletteToSemantic(errorColors, 'colorError'));
  Object.assign(result, mapPaletteToSemantic(infoColors, 'colorInfo'));

  // 对齐 antd：错误填充色悬停态用 step1 与 step3 的混色，过渡更柔和
  result.colorErrorBgFilledHover = new FastColor(errorColors[1])
    .mix(new FastColor(errorColors[3]), 50)
    .toHexString();
  result.colorLink = linkColors[5];
  result.colorLinkHover = linkColors[3];
  result.colorLinkActive = linkColors[6];

  PresetColors.forEach((colorKey) => {
    const colorBase = seed[colorKey];
    if (colorBase) {
      const colorPalette = generateColorPalettes(colorBase);
      result[`${colorKey}Hover`] = colorPalette[4];
      result[`${colorKey}Active`] = colorPalette[6];
    }
  });

  Object.assign(result, neutrals);

  result.colorWhite = '#fff';
  result.colorBgMask = 'rgba(0, 0, 0, 0.45)';

  return result as unknown as ColorMapToken;
}
