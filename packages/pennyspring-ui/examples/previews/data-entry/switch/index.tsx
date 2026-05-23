import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { switchDemos } from './demos';

export function SwitchPreview() {
  return (
    <PreviewScaffold>
      {switchDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SwitchPreview;
