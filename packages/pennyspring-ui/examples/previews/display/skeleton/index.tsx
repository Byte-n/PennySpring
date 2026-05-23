import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { skeletonDemos } from './demos';

export function SkeletonPreview() {
  return (
    <PreviewScaffold>
      {skeletonDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SkeletonPreview;
