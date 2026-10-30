import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { spaceDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Space',
  description: '间距、方向、对齐和换行。',
  order: 8,
  demos: [
    { id: 'align-and-justify', title: 'Align and justify' },
    { id: 'direction', title: 'Direction' },
    { id: 'size', title: 'Size' },
    { id: 'wrap', title: 'Wrap' },
  ],
} satisfies PreviewMeta;

export function SpacePreview() {
  return (
    <PreviewScaffold>
      {spaceDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SpacePreview;
