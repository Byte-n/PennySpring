import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { checkboxDemos } from './demos';

export function CheckboxPreview() {
  return (
    <PreviewScaffold>
      {checkboxDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default CheckboxPreview;
