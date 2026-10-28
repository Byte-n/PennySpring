import type { SeedToken } from '../types';

/**
 * april — 春绿（万物复苏）
 *
 * 呼应「四月是你的谎言」里的春天意象：万物复苏、冰雪消融。
 * 主色压到浅色 4.18 / 深色 3.50 的白字对比，与默认蓝同档，
 * 避免高亮绿在浅色按钮上发虚、在深色下发荧光。
 * link 与 primary 同值，保证单一 seed 在两种算法下都可读。
 */
export const april: Partial<SeedToken> = {
  colorPrimary: '#3C8A66',
  colorSuccess: '#52C41A',
  colorWarning: '#FAAD14',
  colorError: '#F5585C',
  colorInfo: '#1677FF',
  colorLink: '#3C8A66',
};
