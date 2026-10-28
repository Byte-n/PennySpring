import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from './types';

/**
 * 布局组件统一的三档间距：8 / 12 / 16。
 * 对应 token：sizeXS(8) / paddingSM(12) / padding(16)，全部落在 4px 网格。
 */
export function resolveLayoutGap(
  size: ComponentSize,
  token: AliasToken,
): number {
  if (size === 'small') {
    return token.sizeXS;
  }

  if (size === 'large') {
    return token.padding;
  }

  return token.paddingSM;
}
