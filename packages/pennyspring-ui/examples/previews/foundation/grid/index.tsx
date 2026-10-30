import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { gridDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Grid',
  description: '宫格布局和单元格内容。',
  order: 6,
  demos: [
    { id: 'columns', title: 'Columns' },
    { id: 'gap', title: 'Gap' },
    { id: 'span', title: 'Span' },
  ],
} satisfies PreviewMeta;

export function GridPreview() {
  return (
    <PreviewScaffold>
      {gridDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default GridPreview;
