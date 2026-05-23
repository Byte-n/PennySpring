import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { segmentedDemos } from './demos';

export function SegmentedPreview() {
  return (
    <PreviewScaffold>
      {segmentedDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SegmentedPreview;
