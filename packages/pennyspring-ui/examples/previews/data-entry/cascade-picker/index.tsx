import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { cascadePickerDemos } from './demos';

export function CascadePickerPreview() {
  return (
    <PreviewScaffold>
      {cascadePickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default CascadePickerPreview;
