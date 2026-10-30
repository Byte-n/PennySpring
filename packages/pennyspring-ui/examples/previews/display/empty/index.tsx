import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { emptyDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Empty',
  description: '空状态的图标、文案、附加操作和尺寸。',
  order: 6,
  demos: [
    { id: 'variants', title: '形态（variant）' },
    { id: 'size', title: '尺寸（size）' },
    { id: 'slots', title: '插槽组合（slots）' },
  ],
} satisfies PreviewMeta;

export function EmptyPreview() {
  return (
    <PreviewScaffold>
      {emptyDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default EmptyPreview;
