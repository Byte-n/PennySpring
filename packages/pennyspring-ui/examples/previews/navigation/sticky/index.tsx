import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { stickyDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Sticky',
  description: '在业务滚动区域内吸顶或吸底，并保留原始内容占位。',
  order: 11,
  demos: [{ id: 'top-and-bottom', title: '吸顶与吸底' }],
} satisfies PreviewMeta;

export function StickyPreview() {
  return (
    <PreviewScaffold>
      {stickyDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default StickyPreview;
