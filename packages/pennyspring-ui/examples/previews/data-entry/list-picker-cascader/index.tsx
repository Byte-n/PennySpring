import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { listPickerCascaderDemos } from './demos';

export function ListPickerCascaderPreview() {
  return (
    <PreviewScaffold>
      {listPickerCascaderDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ListPickerCascaderPreview;
