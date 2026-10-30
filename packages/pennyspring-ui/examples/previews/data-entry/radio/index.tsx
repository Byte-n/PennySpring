import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { radioDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Radio',
  description: '单选、单选组、chip 形态与只读禁用状态。',
  order: 8,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态（5 种）' },
    { id: 'chip', title: 'button 形态（chip）' },
    { id: 'group', title: '组排布（Group）' },
    { id: 'slots', title: '插槽（slots）' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function RadioPreview() {
  return (
    <PreviewScaffold>
      {radioDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default RadioPreview;
