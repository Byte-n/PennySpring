import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { dataListDemos } from './demos';

export function DataListPreview() {
  return (
    <PreviewScaffold>
      {dataListDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DataListPreview;
