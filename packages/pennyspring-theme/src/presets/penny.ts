import type { SeedToken } from '../types';

/**
 * penny — 暖金琥珀（每一枚硬币）
 *
 * Penny 是最小面额硬币，暖金色象征"积少成多、诚实记录"的朴素坚持。
 * 原 #D4A84B 偏土黄且白字对比仅 2.21，改为更深的琥珀金；
 * info 回归蓝色，避免语义色被品牌色同化。
 */
export const penny: Partial<SeedToken> = {
  colorPrimary: '#A9761F',
  colorSuccess: '#52C41A',
  colorWarning: '#FA8C16',
  colorError: '#CF1322',
  colorInfo: '#1677FF',
  colorLink: '#A9761F',
};
