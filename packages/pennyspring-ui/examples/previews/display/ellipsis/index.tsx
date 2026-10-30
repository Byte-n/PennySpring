import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { ellipsisDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Ellipsis',
  description: '文本截断方向、行数和展开收起。',
  order: 4,
  demos: [
    { id: 'direction', title: 'Direction' },
    { id: 'expand-and-collapse', title: 'Expand and collapse' },
    { id: 'rows-and-size', title: 'Rows and size' },
  ],
} satisfies PreviewMeta;

export function EllipsisPreview() {
  return (
    <PreviewScaffold>
      {ellipsisDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default EllipsisPreview;
