import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { textareaDemos } from './demos';

export function TextareaPreview() {
  return (
    <PreviewScaffold>
      {textareaDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TextareaPreview;
