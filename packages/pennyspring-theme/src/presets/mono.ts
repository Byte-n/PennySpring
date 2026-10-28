import type { SeedToken } from '../types';

/**
 * mono — 墨白（黑白摄影）
 *
 * 纯中性灰主色。单一 seed 同时派生浅/深两套调色板，
 * 纯黑在深色模式下会与背景融为一体，因此取中灰（浅色 4.29 / 深色 3.46），
 * 语义色保持红/绿/琥珀以保证收支可读性。
 */
export const mono: Partial<SeedToken> = {
  colorPrimary: '#7A7A7A',
  colorSuccess: '#52C41A',
  colorWarning: '#FAAD14',
  colorError: '#FF4D4F',
  colorInfo: '#1677FF',
  colorLink: '#7A7A7A',
};
