import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { popoverDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Popover',
  description: '锚定触发元素的轻量浮层、触发方式与自动翻转。',
  order: 9,
  demos: [
    { id: 'trigger', title: '触发方式' },
    { id: 'placement', title: '弹出方向' },
  ],
} satisfies PreviewMeta;

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
