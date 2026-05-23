import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { progressDemos } from './demos';

export function ProgressPreview() {
  return (
    <PreviewScaffold>
      {progressDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ProgressPreview;
