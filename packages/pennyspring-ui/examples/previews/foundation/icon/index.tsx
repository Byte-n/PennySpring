import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { iconDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Icon',
  description: '图标映射、尺寸、颜色和视觉权重。',
  order: 12,
  demos: [
    { id: 'common-icons', title: 'Common icons' },
    { id: 'size-and-color', title: 'Size and color' },
    { id: 'weight-and-mirrored', title: 'Weight and mirrored' },
  ],
} satisfies PreviewMeta;

export function IconPreview() {
  return (
    <PreviewScaffold>
      {iconDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default IconPreview;
