import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { swipeActionDemos } from './demos';

export function SwipeActionPreview() {
  return (
    <PreviewScaffold>
      {swipeActionDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SwipeActionPreview;
