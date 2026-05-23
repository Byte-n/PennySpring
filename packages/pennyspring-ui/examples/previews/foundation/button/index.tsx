import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { buttonDemos } from './demos';

export function ButtonPreview() {
  return (
    <PreviewScaffold>
      {buttonDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ButtonPreview;
