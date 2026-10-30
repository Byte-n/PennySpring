import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { stepsDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Steps',
  description: '步骤尺寸、四态、只读/禁用、深色与交互。',
  order: 4,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态（status）' },
    { id: 'readonly-and-disabled', title: '只读 / 禁用' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function StepsPreview() {
  return (
    <PreviewScaffold>
      {stepsDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default StepsPreview;
