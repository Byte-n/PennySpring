import type { SeedToken, PresetColorGradientToken } from '../types';
import {
  generateColorPalettes,
  generateColorPalettesDark,
} from './colorPalettes';

export function genPresetColorPalettes(
  seed: SeedToken,
  algorithm: 'default' | 'dark',
): PresetColorGradientToken {
  const generatePalette =
    algorithm === 'dark' ? generateColorPalettesDark : generateColorPalettes;

  const presetColors = [
    'blue',
    'purple',
    'cyan',
    'green',
    'magenta',
    'pink',
    'red',
    'orange',
    'yellow',
    'volcano',
    'geekblue',
    'lime',
    'gold',
  ];

  const result: Record<string, string> = {};
  for (const color of presetColors) {
    const baseColor = seed[color as keyof typeof seed] as string;
    const palette = generatePalette(baseColor);
    for (let i = 0; i < 10; i++) {
      result[`${color}${i + 1}`] = palette[i];
    }
  }
  return result as PresetColorGradientToken;
}
