import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { resultDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Result',
  description: '结果状态、尺寸、页内/卡片承载与无图标。',
  order: 9,
  demos: [
    { id: 'status', title: '状态（status）' },
    { id: 'size', title: '尺寸（size）' },
    { id: 'container', title: '承载场景' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function ResultPreview() {
  return (
    <PreviewScaffold>
      {resultDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ResultPreview;
