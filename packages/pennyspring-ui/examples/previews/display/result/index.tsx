import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { resultDemos } from './demos';

export function ResultPreview() {
  return (
    <PreviewScaffold>
      {resultDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ResultPreview;
