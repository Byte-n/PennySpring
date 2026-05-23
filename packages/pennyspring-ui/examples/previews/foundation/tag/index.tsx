import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tagDemos } from './demos';

export function TagPreview() {
  return (
    <PreviewScaffold>
      {tagDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TagPreview;
