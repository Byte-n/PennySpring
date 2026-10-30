import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { segmentedDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Segmented',
  description: '分段选择、图标选项、全宽与禁用状态。',
  order: 10,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态' },
    { id: 'content', title: '内容组合' },
    { id: 'block', title: '全宽与受控' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function SegmentedPreview() {
  return (
    <PreviewScaffold>
      {segmentedDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SegmentedPreview;
