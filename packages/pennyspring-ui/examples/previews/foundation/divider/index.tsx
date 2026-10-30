import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { dividerDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Divider',
  description: '分割线方向、内容位置和尺寸。',
  order: 13,
  demos: [
    { id: 'horizontal', title: 'Horizontal' },
    { id: 'size', title: 'Size' },
    { id: 'vertical', title: 'Vertical' },
  ],
} satisfies PreviewMeta;

export function DividerPreview() {
  return (
    <PreviewScaffold>
      {dividerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DividerPreview;
