import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tabsDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Tabs',
  description: '标签切换、内容面板、wrap/scroll/block 排布与禁用状态。',
  order: 11,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态' },
    { id: 'layouts', title: '排布与面板' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function TabsPreview() {
  return (
    <PreviewScaffold>
      {tabsDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TabsPreview;
