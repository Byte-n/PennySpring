import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { cascaderDemos } from './demos';

export function CascaderPreview() {
  return (
    <PreviewScaffold>
      {cascaderDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default CascaderPreview;
