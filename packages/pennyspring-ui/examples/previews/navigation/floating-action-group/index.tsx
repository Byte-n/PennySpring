import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { floatingActionGroupDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'FloatingActionGroup',
  description: '悬浮按钮组：任意定位、更多展开、三种展开方向与 mountPoint。',
  order: 8,
  demos: [
    { id: 'event-feedback', title: 'Event feedback' },
    { id: 'placement-and-mount-point', title: 'Placement and mountPoint' },
    { id: 'preview-canvas', title: 'Preview canvas' },
  ],
} satisfies PreviewMeta;

export function FloatingActionGroupPreview() {
  return (
    <PreviewScaffold>
      {floatingActionGroupDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default FloatingActionGroupPreview;
