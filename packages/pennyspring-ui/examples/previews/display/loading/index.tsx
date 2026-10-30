import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { loadingDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Loading',
  description: '加载指示器尺寸、方向和自定义内容。',
  order: 7,
  demos: [
    { id: 'variants', title: '形态（variant）' },
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '文案与特殊状态' },
  ],
} satisfies PreviewMeta;

export function LoadingPreview() {
  return (
    <PreviewScaffold>
      {loadingDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default LoadingPreview;
