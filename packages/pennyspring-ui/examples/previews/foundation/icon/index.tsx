import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { iconDemos } from './demos';

export function IconPreview() {
  return (
    <PreviewScaffold>
      {iconDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default IconPreview;
