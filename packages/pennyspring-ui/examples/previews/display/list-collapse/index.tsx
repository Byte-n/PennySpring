import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { listCollapseDemos } from './demos';

export function ListCollapsePreview() {
  return (
    <PreviewScaffold>
      {listCollapseDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ListCollapsePreview;
