import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tooltipDemos } from './demos';

export function TooltipPreview() {
  return (
    <PreviewScaffold>
      {tooltipDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TooltipPreview;
