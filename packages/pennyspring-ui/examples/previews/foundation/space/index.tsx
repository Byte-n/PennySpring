import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { spaceDemos } from './demos';

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
