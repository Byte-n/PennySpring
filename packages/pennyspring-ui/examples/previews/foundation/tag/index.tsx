import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tagDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Tag',
  description: '标签颜色、变体、尺寸和状态。',
  order: 9,
  demos: [
    { id: 'preset-colors', title: 'Preset colors' },
    { id: 'semantic-colors', title: 'Semantic colors' },
    { id: 'size-and-state', title: 'Size and state' },
    { id: 'variants', title: 'Variants' },
  ],
} satisfies PreviewMeta;

export function TagPreview() {
  return (
    <PreviewScaffold>
      {tagDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TagPreview;
