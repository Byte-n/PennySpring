const FONT_WEIGHT_MIN = 100;
const FONT_WEIGHT_STEP = 100;

function clampFontWeight(fontWeight: number): number {
  return Math.max(FONT_WEIGHT_MIN, fontWeight);
}

export function genFontWeightMap(fontWeight: number): Record<string, number> {
  return {
    fontWeightLight: clampFontWeight(fontWeight - FONT_WEIGHT_STEP),
    fontWeightRegular: clampFontWeight(fontWeight),
    fontWeightMedium: clampFontWeight(fontWeight + FONT_WEIGHT_STEP),
    fontWeightSemiBold: clampFontWeight(fontWeight + FONT_WEIGHT_STEP * 2),
    fontWeightBold: clampFontWeight(fontWeight + FONT_WEIGHT_STEP * 3),
  };
}
