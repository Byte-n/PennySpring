import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { imagePickerDemos } from './demos';

export function ImagePickerPreview() {
  return (
    <PreviewScaffold>
      {imagePickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ImagePickerPreview;
