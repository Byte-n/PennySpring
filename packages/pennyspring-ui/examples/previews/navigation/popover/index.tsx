import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { popoverDemos } from './demos';

export function PopoverPreview() {
  return (
    <PreviewScaffold>
      {popoverDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default PopoverPreview;
