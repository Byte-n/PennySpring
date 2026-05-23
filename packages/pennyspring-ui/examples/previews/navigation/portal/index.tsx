import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { portalDemos } from './demos';

export function PortalPreview() {
  return (
    <PreviewScaffold>
      {portalDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default PortalPreview;
