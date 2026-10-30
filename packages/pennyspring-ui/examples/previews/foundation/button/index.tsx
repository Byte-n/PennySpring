import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { buttonDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Button',
  description: '按钮类型、变体、尺寸、图标和状态。',
  order: 4,
  demos: [
    { id: 'type', title: '类型（type）' },
    { id: 'variant', title: '变体 × 颜色（variant × color）' },
    { id: 'size-and-shape', title: '尺寸、形状与图标位' },
    { id: 'state', title: '状态' },
    { id: 'preset', title: '预设色（API 支持，不推荐）' },
    { id: 'block', title: '全宽按钮（block）' },
  ],
} satisfies PreviewMeta;

export function ButtonPreview() {
  return (
    <PreviewScaffold>
      {buttonDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ButtonPreview;
