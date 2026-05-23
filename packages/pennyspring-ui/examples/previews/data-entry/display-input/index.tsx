import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { displayInputDemos } from './demos';

export function DisplayInputPreview() {
  return (
    <PreviewScaffold>
      {displayInputDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DisplayInputPreview;
