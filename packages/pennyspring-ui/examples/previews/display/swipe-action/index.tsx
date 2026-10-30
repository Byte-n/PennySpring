import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { swipeActionDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'SwipeAction',
  description: '左右滑操作、动作颜色、尺寸与只读状态。',
  order: 5,
  demos: [
    { id: 'left-and-right-actions', title: 'Left and right actions' },
    { id: 'size-and-readonly', title: 'Size and readonly' },
  ],
} satisfies PreviewMeta;

export function SwipeActionPreview() {
  return (
    <PreviewScaffold>
      {swipeActionDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SwipeActionPreview;
