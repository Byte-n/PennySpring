import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { loadingDemos } from './demos';

export function LoadingPreview() {
  return (
    <PreviewScaffold>
      {loadingDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default LoadingPreview;
