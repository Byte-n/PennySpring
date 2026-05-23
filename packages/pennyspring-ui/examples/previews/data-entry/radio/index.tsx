import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { radioDemos } from './demos';

export function RadioPreview() {
  return (
    <PreviewScaffold>
      {radioDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default RadioPreview;
