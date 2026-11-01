import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { portalDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Portal',
  description: '跨层级浮层挂载。',
  order: 7,
  demos: [{ id: 'mount-only', title: 'Mount only' }],
} satisfies PreviewMeta;

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
