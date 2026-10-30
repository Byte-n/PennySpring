import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { skeletonDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Skeleton',
  description: '骨架形状、尺寸、组合用法、动画与加载切换。',
  order: 8,
  demos: [
    { id: 'shape', title: '形状与尺寸' },
    { id: 'composition', title: '组合用法' },
    { id: 'states', title: '状态' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function SkeletonPreview() {
  return (
    <PreviewScaffold>
      {skeletonDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SkeletonPreview;
