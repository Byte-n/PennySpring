import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { pickerCascaderDemos } from './demos';

export function PickerCascaderPreview() {
  return (
    <PreviewScaffold>
      {pickerCascaderDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default PickerCascaderPreview;
