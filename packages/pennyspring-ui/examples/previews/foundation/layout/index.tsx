import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { layoutDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Layout',
  description: 'Row、Column、Spacer、GeometryReader 布局原语。',
  order: 7,
  demos: [
    { id: 'column', title: 'Column' },
    { id: 'geometry-reader', title: 'GeometryReader' },
    { id: 'row', title: 'Row' },
    { id: 'spacer', title: 'Spacer' },
  ],
} satisfies PreviewMeta;

export function LayoutPreview() {
  return (
    <PreviewScaffold>
      {layoutDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default LayoutPreview;
