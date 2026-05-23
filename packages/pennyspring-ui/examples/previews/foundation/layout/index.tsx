import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { layoutDemos } from './demos';

export function LayoutPreview() {
  return (
    <PreviewScaffold>
      {layoutDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default LayoutPreview;
