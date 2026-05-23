import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { pickerDemos } from './demos';

export function PickerPreview() {
  return (
    <PreviewScaffold>
      {pickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default PickerPreview;
