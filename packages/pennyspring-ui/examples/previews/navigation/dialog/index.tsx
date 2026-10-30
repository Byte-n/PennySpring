import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { dialogDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Dialog',
  description: '对话框尺寸、受控打开和操作状态。',
  order: 2,
  demos: [
    { id: 'animation', title: 'Dialog 动画' },
    { id: 'controlled', title: 'Controlled' },
    { id: 'event-feedback', title: 'Event feedback' },
    { id: 'state-and-slots', title: 'State and slots' },
  ],
} satisfies PreviewMeta;

export function DialogPreview() {
  return (
    <PreviewScaffold>
      {dialogDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DialogPreview;
