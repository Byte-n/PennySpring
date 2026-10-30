import { ThemePreview } from '@pennyspring/theme';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Theme',
  description: '主题算法、预设色和设计 token 预览。',
  order: 1,
  demos: [
    { id: 'basic', title: 'Basic', description: '主题算法、预设色和设计 token 预览。' },
  ],
} satisfies PreviewMeta;

export default ThemePreview;
