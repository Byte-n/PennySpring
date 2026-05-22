import { generate } from '@ant-design/colors';

const defaultIndexMap: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 4,
  9: 5,
  10: 6,
};

const darkIndexMap: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 6,
  6: 5,
  7: 4,
  8: 6,
  9: 5,
  10: 4,
};

export function generateColorPalettes(baseColor: string): string[] {
  const colors = generate(baseColor);
  return Array.from({ length: 10 }, (_, i) => {
    const step = i + 1;
    return colors[defaultIndexMap[step]];
  });
}

export function generateColorPalettesDark(baseColor: string): string[] {
  const colors = generate(baseColor, { theme: 'dark' });
  return Array.from({ length: 10 }, (_, i) => {
    const step = i + 1;
    return colors[darkIndexMap[step]];
  });
}
