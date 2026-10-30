import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { indexBarDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'IndexBar',
  description: '索引字母尺寸、选中/禁用、拖动气泡与吸顶分组。',
  order: 6,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态' },
  ],
} satisfies PreviewMeta;

export function IndexBarPreview() {
  return (
    <PreviewScaffold>
      {indexBarDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default IndexBarPreview;
