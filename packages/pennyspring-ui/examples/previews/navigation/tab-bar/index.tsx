import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tabBarDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'TabBar',
  description: '底部标签栏、图标/文字/角标组合、尺寸与禁用状态。',
  order: 5,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态与角标' },
    { id: 'composition', title: '结构组合' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function TabBarPreview() {
  return (
    <PreviewScaffold>
      {tabBarDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TabBarPreview;
