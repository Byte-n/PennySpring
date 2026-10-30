import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { formDemos } from './demos';

export function FormPreview() {
  return (
    <PreviewScaffold>
      {formDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default FormPreview;
