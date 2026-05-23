import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { stepsDemos } from './demos';

export function StepsPreview() {
  return (
    <PreviewScaffold>
      {stepsDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default StepsPreview;
