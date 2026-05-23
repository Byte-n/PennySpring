import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { carouselDemos } from './demos';

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
