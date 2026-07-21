export function genRadius(baseRadius: number): {
  borderRadiusLG: number;
  borderRadiusSM: number;
  borderRadiusXS: number;
  borderRadiusOuter: number;
} {
  // 移动端圆角刻度：以 base 为锚按比例派生，整体大于 antd v5 的 PC 基准，
  // 让浮层与内容卡片拉开差距以突出视觉层次。
  // 层级：XS(chip/badge) < SM(控件/单元) < base(内容卡片) < LG(浮层)
  const borderRadiusXS = Math.max(2, Math.floor(baseRadius / 3));
  const borderRadiusSM = Math.max(4, Math.floor((baseRadius * 2) / 3));
  const borderRadiusLG = baseRadius + 4;
  const borderRadiusOuter = baseRadius;
  return { borderRadiusLG, borderRadiusSM, borderRadiusXS, borderRadiusOuter };
}
