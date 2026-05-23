import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { inputDemos } from './demos';

export function InputPreview() {
  return (
    <PreviewScaffold>
      {inputDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default InputPreview;
