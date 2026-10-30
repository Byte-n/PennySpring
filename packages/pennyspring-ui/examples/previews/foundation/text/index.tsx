import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { textDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Text',
  description: '文本尺寸、颜色和字重。',
  order: 2,
  demos: [
    { id: 'color', title: 'Color' },
    { id: 'size', title: 'Size' },
    { id: 'weight', title: 'Weight' },
  ],
} satisfies PreviewMeta;

export function TextPreview() {
  return (
    <PreviewScaffold>
      {textDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TextPreview;
