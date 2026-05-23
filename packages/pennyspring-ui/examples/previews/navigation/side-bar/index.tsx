import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { sideBarDemos } from './demos';

export function SideBarPreview() {
  return (
    <PreviewScaffold>
      {sideBarDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SideBarPreview;
