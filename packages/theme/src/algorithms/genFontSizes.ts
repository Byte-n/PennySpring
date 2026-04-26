/**
 * 字体尺寸梯度算法，对齐 ant-design 的实现。
 * 参考: https://zhuanlan.zhihu.com/p/32746810
 *
 * 以 base 为第 1 级（index=1），向左缩小一档（index=0）、向右逐级放大。
 * base=14 输出: [12, 14, 16, 20, 24, 30, 38, 46, 56, 68]
 */
export function genFontSizes(base: number): number[] {
  const fontSizes: number[] = Array.from({ length: 10 }, (_, index) => {
    const i = index - 1;
    const baseSize = base * Math.E ** (i / 5);
    // index=0 向上取整保证不等于 base；其余向下取整
    const intSize = index > 1 ? Math.floor(baseSize) : Math.ceil(baseSize);
    // 归一到偶数
    return Math.floor(intSize / 2) * 2;
  });
  fontSizes[1] = base;
  return fontSizes;
}
