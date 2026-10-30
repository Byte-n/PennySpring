import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { carouselDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Carousel',
  description: '指示点/计数、单页/露边/纵向排布、深色与边界。',
  order: 1,
  demos: [
    { id: 'indicators', title: '指示器' },
    { id: 'layout', title: '排布' },
    { id: 'states', title: '深色与边界' },
  ],
} satisfies PreviewMeta;

export function CarouselPreview() {
  return (
    <PreviewScaffold>
      {carouselDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default CarouselPreview;
