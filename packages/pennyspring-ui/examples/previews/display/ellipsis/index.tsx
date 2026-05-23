import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { ellipsisDemos } from './demos';

export function EllipsisPreview() {
  return (
    <PreviewScaffold>
      {ellipsisDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default EllipsisPreview;
