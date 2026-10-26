import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { listPickerDemos } from './demos';

export function ListPickerPreview() {
  return (
    <PreviewScaffold>
      {listPickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ListPickerPreview;
