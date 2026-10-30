import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { toastDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Toast',
  description: '轻提示组件与 useToast。',
  order: 1,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'status', title: '内容形态（status）' },
    { id: 'placement', title: '定位（placement）' },
    { id: 'replace', title: '单实例替换' },
  ],
} satisfies PreviewMeta;

export function ToastPreview() {
  return (
    <PreviewScaffold>
      {toastDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ToastPreview;
