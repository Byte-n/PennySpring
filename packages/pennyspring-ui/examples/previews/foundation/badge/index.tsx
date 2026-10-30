import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { badgeDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Badge',
  description: '计数、圆点、语义色、尺寸与挂角环。',
  order: 5,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'color', title: '语义色' },
    { id: 'dot-and-overflow', title: '圆点与溢出' },
    { id: 'anchored', title: '挂角（有 children）' },
  ],
} satisfies PreviewMeta;

export function BadgePreview() {
  return (
    <PreviewScaffold>
      {badgeDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default BadgePreview;
