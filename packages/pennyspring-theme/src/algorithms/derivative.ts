import type { SeedToken, MapToken } from '../types';
import { genPresetColorPalettes } from './genPresetColorPalettes';
import { genColorMapToken } from './genColorMapToken';
import { genSizeMapToken } from './genSizeMapToken';
import { genFontMapToken } from './genFontMapToken';
import { genFontWeightMap } from './genFontWeightMap';
import { genControlHeight } from './genControlHeight';
import { genCommonMapToken } from './genCommonMapToken';
import { PresetColors } from '../presetColors';
import {
  generateColorPalettes,
  generateColorPalettesDark,
} from './colorPalettes';
import {
  generateNeutralColorPalettes,
  generateNeutralColorPalettesDark,
} from './neutralPalettes';

/**
 * 主题派生管线：seed → MapToken
 *
 * 算法组合：
 * - default: 浅色基线
 * - dark:    基于 default 再用暗色调色板覆盖，保证字段完整性
 *
 * 移动端不提供 compact 算法：compact 会使 controlHeight 跌破 44×44 触达区底线，
 * 且手机屏本身已是紧凑形态，无信息密度红利。密集场景请直接覆盖 SeedToken。
 */
export function derivative(
  seed: SeedToken,
  isDark: boolean,
): MapToken {
  // --- Step 1. 浅色 baseline --- //
  const baseColorMap = genColorMapToken(seed, {
    generateColorPalettes,
    generateNeutralColorPalettes,
  });
  const baseColorPalettes = genPresetColorPalettes(seed, 'default');

  // --- Step 2. 暗色覆盖（若启用） --- //
  let colorMap = baseColorMap;
  let colorPalettes = baseColorPalettes;

  if (isDark) {
    const darkColorMap = genColorMapToken(seed, {
      generateColorPalettes: generateColorPalettesDark,
      generateNeutralColorPalettes: generateNeutralColorPalettesDark,
    });

    // 预设色 hover/active 在暗色模式需用更亮的梯度（对齐 antd）
    const presetColorHoverActive: Record<string, string> = {};
    PresetColors.forEach((colorKey) => {
      const colorBase = seed[colorKey];
      if (colorBase) {
        const colorPalette = generateColorPalettesDark(colorBase);
        presetColorHoverActive[`${colorKey}Hover`] = colorPalette[6];
        presetColorHoverActive[`${colorKey}Active`] = colorPalette[4];
      }
    });

    // 以 baseColorMap 作为 baseline 兜底，再用 dark 字段覆盖，
    // 保证未来新增字段若 dark colors 忘记产出，也能拿到 default 值。
    colorMap = {
      ...baseColorMap,
      ...darkColorMap,
      ...presetColorHoverActive,
      // 暗色模式下 colorPrimaryBg 对比度不足，选中状态几乎不可见。
      // 用更饱和的 colorPrimaryBorder 替代，提升选中项背景的辨识度。
      // Customize selected item background color
      // https://github.com/ant-design/ant-design/issues/30524#issuecomment-871961867
      colorPrimaryBg: darkColorMap.colorPrimaryBorder,
      colorPrimaryBgHover: darkColorMap.colorPrimaryBorderHover,
    };

    colorPalettes = genPresetColorPalettes(seed, 'dark');
  }

  // --- Step 3. 尺寸与字体 --- //
  const sizeMap = genSizeMapToken(seed);
  const fontMap = genFontMapToken(seed.fontSize);
  const fontWeightMap = genFontWeightMap(seed.fontWeight);
  const heightMap = genControlHeight(seed.controlHeight);

  const commonMap = genCommonMapToken({
    motionUnit: seed.motionUnit,
    motionBase: seed.motionBase,
    lineWidth: seed.lineWidth,
    borderRadius: seed.borderRadius,
  });

  return {
    ...seed,
    ...colorPalettes,
    ...colorMap,
    ...sizeMap,
    ...fontMap,
    ...fontWeightMap,
    ...heightMap,
    ...commonMap,
  } as MapToken;
}
