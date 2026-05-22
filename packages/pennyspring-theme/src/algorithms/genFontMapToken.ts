import { genFontSizes } from './genFontSizes';

function round(value: number): number {
  return Math.round(value);
}

export function genFontMapToken(base: number): Record<string, number> {
  const fontSizes = genFontSizes(base);
  const fontSizeSM = fontSizes[0];
  const fontSize = fontSizes[1];
  const fontSizeLG = fontSizes[2];
  const fontSizeXL = fontSizes[3];

  const fontSizeHeading1 = fontSizes[6];
  const fontSizeHeading2 = fontSizes[5];
  const fontSizeHeading3 = fontSizes[4];
  const fontSizeHeading4 = fontSizes[3];
  const fontSizeHeading5 = fontSizes[2];

  // 行高公式从 ant-design 原版 (fontSize + 8) 调整为 (fontSize + 10)：
  // 中文字符视觉密度高于拉丁字符，+8 在 16px 正文下行高=1.5 偏紧；
  // +10 在 16px 下行高≈ 1.625，20px 下≈ 1.5，更靠近中文阅读舒适区。
  // 输出为像素值，可直接用于 RN lineHeight 样式。
  const lineHeightRatio = ((fontSize + 10) / fontSize * 1000) / 1000;
  const lineHeightSMRatio = ((fontSizeSM + 10) / fontSizeSM * 1000) / 1000;
  const lineHeightLGRatio = ((fontSizeLG + 10) / fontSizeLG * 1000) / 1000;
  const lineHeightHeading1Ratio = ((fontSizeHeading1 + 10) / fontSizeHeading1 * 1000) / 1000;
  const lineHeightHeading2Ratio = ((fontSizeHeading2 + 10) / fontSizeHeading2 * 1000) / 1000;
  const lineHeightHeading3Ratio = ((fontSizeHeading3 + 10) / fontSizeHeading3 * 1000) / 1000;
  const lineHeightHeading4Ratio = ((fontSizeHeading4 + 10) / fontSizeHeading4 * 1000) / 1000;
  const lineHeightHeading5Ratio = ((fontSizeHeading5 + 10) / fontSizeHeading5 * 1000) / 1000;

  const lineHeight = round(lineHeightRatio * fontSize);
  const lineHeightSM = round(lineHeightSMRatio * fontSizeSM);
  const lineHeightLG = round(lineHeightLGRatio * fontSizeLG);
  const lineHeightXL = round(lineHeightHeading4Ratio * fontSizeXL);
  const lineHeightHeading1 = round(lineHeightHeading1Ratio * fontSizeHeading1);
  const lineHeightHeading2 = round(lineHeightHeading2Ratio * fontSizeHeading2);
  const lineHeightHeading3 = round(lineHeightHeading3Ratio * fontSizeHeading3);
  const lineHeightHeading4 = round(lineHeightHeading4Ratio * fontSizeHeading4);
  const lineHeightHeading5 = round(lineHeightHeading5Ratio * fontSizeHeading5);

  return {
    fontSizeSM,
    fontSize,
    fontSizeLG,
    fontSizeXL,
    fontSizeHeading1,
    fontSizeHeading2,
    fontSizeHeading3,
    fontSizeHeading4,
    fontSizeHeading5,
    lineHeight,
    lineHeightLG,
    lineHeightSM,
    lineHeightXL,
    lineHeightHeading1,
    lineHeightHeading2,
    lineHeightHeading3,
    lineHeightHeading4,
    lineHeightHeading5,
  };
}
