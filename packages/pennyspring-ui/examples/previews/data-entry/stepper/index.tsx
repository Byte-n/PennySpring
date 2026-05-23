import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { stepperDemos } from './demos';

export function StepperPreview() {
  return (
    <PreviewScaffold>
      {stepperDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default StepperPreview;
