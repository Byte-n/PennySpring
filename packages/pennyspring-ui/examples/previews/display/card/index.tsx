import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { cardDemos } from './demos';

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
