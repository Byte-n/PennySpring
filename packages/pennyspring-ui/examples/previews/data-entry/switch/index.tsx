import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { switchDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Switch',
  description: '细轨道开关、轨道外文案、尺寸与禁用只读状态。',
  order: 9,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态' },
    { id: 'row', title: '文案与整行组合' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function SwitchPreview() {
  return (
    <PreviewScaffold>
      {switchDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SwitchPreview;
