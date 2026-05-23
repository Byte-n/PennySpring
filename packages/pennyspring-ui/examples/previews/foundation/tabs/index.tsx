import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tabsDemos } from './demos';

export function TabsPreview() {
  return (
    <PreviewScaffold>
      {tabsDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TabsPreview;
