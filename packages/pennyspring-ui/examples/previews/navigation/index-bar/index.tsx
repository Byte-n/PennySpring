import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { indexBarDemos } from './demos';

export function IndexBarPreview() {
  return (
    <PreviewScaffold>
      {indexBarDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default IndexBarPreview;
