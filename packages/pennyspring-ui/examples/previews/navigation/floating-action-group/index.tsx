import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { floatingActionGroupDemos } from './demos';

export function FloatingActionGroupPreview() {
  return (
    <PreviewScaffold>
      {floatingActionGroupDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default FloatingActionGroupPreview;
