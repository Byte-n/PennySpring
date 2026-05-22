import { FastColor } from '@ant-design/fast-color';

/**
 * 将 frontColor 在 backgroundColor 背景下，反推为一个带 alpha 的等效颜色。
 * 对齐 ant-design 的实现：遍历 alpha，解方程得到满足 0..255 范围的纯 rgb，再以该纯色 + alpha 输出。
 *
 * 注意：与直接 `front.setA(alpha)` 不同。这里返回的 rgba 会带有视觉等效的 rgb 基底，
 * 用于 colorSplit / controlOutline / colorErrorOutline / colorWarningOutline 等派生。
 */
function isStableColor(color: number): boolean {
  return color >= 0 && color <= 255;
}

export function getAlphaColor(frontColor: string, backgroundColor: string): string {
  const { r: fR, g: fG, b: fB, a: originAlpha } = new FastColor(frontColor).toRgb();
  // 如果前景本身已经带透明度，直接返回（避免二次叠加）
  if (originAlpha < 1) {
    return frontColor;
  }

  const { r: bR, g: bG, b: bB } = new FastColor(backgroundColor).toRgb();

  for (let fA = 0.01; fA <= 1; fA += 0.01) {
    const r = Math.round((fR - bR * (1 - fA)) / fA);
    const g = Math.round((fG - bG * (1 - fA)) / fA);
    const b = Math.round((fB - bB * (1 - fA)) / fA);
    if (isStableColor(r) && isStableColor(g) && isStableColor(b)) {
      return new FastColor({ r, g, b, a: Math.round(fA * 100) / 100 }).toRgbString();
    }
  }

  // fallback：遍历未命中时直接用原色不透明输出
  return new FastColor({ r: fR, g: fG, b: fB, a: 1 }).toRgbString();
}
