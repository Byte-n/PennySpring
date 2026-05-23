import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { listDemos } from './demos';

export function ListPreview() {
  return (
    <PreviewScaffold>
      {listDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ListPreview;
