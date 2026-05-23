import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { dividerDemos } from './demos';

export function DividerPreview() {
  return (
    <PreviewScaffold>
      {dividerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DividerPreview;
