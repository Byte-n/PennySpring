import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tagPickerDemos } from './demos';

export function TagPickerPreview() {
  return (
    <PreviewScaffold>
      {tagPickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TagPickerPreview;
