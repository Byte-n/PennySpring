import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { wheelGroupDemos } from './demos';

export function WheelGroupPreview() {
  return (
    <PreviewScaffold>
      {wheelGroupDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default WheelGroupPreview;
