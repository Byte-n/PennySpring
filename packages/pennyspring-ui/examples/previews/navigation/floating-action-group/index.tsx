import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { floatingActionGroupDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'FloatingActionGroup',
  description:
    '悬浮按钮组：贴边书签头、独立拖拽 / 自动贴边、网格与扇形动作菜单。',
  order: 8,
  demos: [
    { id: 'grid', title: '网格与贴边' },
    { id: 'fan', title: '扇形展开' },
    { id: 'count-lab', title: '数量与属性' },
  ],
} satisfies PreviewMeta;

export function FloatingActionGroupPreview() {
  return (
    <PreviewScaffold>
      {floatingActionGroupDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default FloatingActionGroupPreview;
