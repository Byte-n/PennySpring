import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { emptyDemos } from './demos';

export function EmptyPreview() {
  return (
    <PreviewScaffold>
      {emptyDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default EmptyPreview;
