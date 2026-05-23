import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { selectionListDemos } from './demos';

export function SelectionListPreview() {
  return (
    <PreviewScaffold>
      {selectionListDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SelectionListPreview;
