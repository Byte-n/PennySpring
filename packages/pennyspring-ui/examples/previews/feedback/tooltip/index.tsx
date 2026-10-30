import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tooltipDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Tooltip',
  description: '纯文本轻提示：深浅两套底色、三种触发、自动翻面与超长滚动。',
  order: 4,
  demos: [
    { id: 'variant', title: '变体（variant）' },
    { id: 'trigger', title: '触发方式（trigger）' },
    { id: 'placement', title: '方位（placement）' },
    { id: 'overflow', title: '尺寸与溢出' },
  ],
} satisfies PreviewMeta;

export function TooltipPreview() {
  return (
    <PreviewScaffold>
      {tooltipDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TooltipPreview;
