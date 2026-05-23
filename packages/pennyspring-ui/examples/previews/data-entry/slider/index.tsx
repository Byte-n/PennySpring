import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { sliderDemos } from './demos';

export function SliderPreview() {
  return (
    <PreviewScaffold>
      {sliderDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SliderPreview;
