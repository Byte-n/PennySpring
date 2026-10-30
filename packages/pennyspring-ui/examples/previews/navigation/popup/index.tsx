import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { popupDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Popup',
  description: '弹层位置、尺寸、遮罩和 FloatingPanel 操作。',
  order: 10,
  demos: [
    { id: 'animation', title: 'Animation' },
    { id: 'event-feedback', title: 'Event feedback' },
    { id: 'floating-panel', title: 'FloatingPanel' },
    { id: 'mask-and-close-behavior', title: 'Mask and close behavior' },
    { id: 'position', title: 'Position' },
  ],
} satisfies PreviewMeta;

export function PopupPreview() {
  return (
    <PreviewScaffold>
      {popupDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default PopupPreview;
