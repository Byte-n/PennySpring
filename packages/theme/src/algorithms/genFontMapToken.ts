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
  const lineHeight = round(((fontSize + 10) / fontSize) * 1000) / 1000;
  const lineHeightSM = round(((fontSizeSM + 10) / fontSizeSM) * 1000) / 1000;
  const lineHeightLG = round(((fontSizeLG + 10) / fontSizeLG) * 1000) / 1000;
  const lineHeightHeading1 = round(((fontSizeHeading1 + 10) / fontSizeHeading1) * 1000) / 1000;
  const lineHeightHeading2 = round(((fontSizeHeading2 + 10) / fontSizeHeading2) * 1000) / 1000;
  const lineHeightHeading3 = round(((fontSizeHeading3 + 10) / fontSizeHeading3) * 1000) / 1000;
  const lineHeightHeading4 = round(((fontSizeHeading4 + 10) / fontSizeHeading4) * 1000) / 1000;
  const lineHeightHeading5 = round(((fontSizeHeading5 + 10) / fontSizeHeading5) * 1000) / 1000;

  const fontHeight = round(lineHeight * fontSize);
  const fontHeightSM = round(lineHeightSM * fontSizeSM);
  const fontHeightLG = round(lineHeightLG * fontSizeLG);

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
    fontHeight,
    fontHeightSM,
    fontHeightLG,
    lineHeightHeading1,
    lineHeightHeading2,
    lineHeightHeading3,
    lineHeightHeading4,
    lineHeightHeading5,
  };
}
