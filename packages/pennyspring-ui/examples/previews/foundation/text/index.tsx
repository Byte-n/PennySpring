import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { textDemos } from './demos';

export function TextPreview() {
  return (
    <PreviewScaffold>
      {textDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TextPreview;
