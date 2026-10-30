import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { cardDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Card',
  description: '普通、摘要和层级容器。',
  order: 2,
  demos: [
    { id: 'variants', title: '变体（variant）' },
    { id: 'size', title: '尺寸（size）' },
    { id: 'slots', title: '插槽组合（slots）' },
    { id: 'state', title: '状态（state）' },
  ],
} satisfies PreviewMeta;

export function CardPreview() {
  return (
    <PreviewScaffold>
      {cardDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default CardPreview;
