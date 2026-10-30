import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { textareaDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Textarea',
  description: '多行输入、计数、错误和只读状态。',
  order: 6,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'status', title: '状态（status）' },
    { id: 'slots', title: '行数、计数与加载' },
  ],
} satisfies PreviewMeta;

export function TextareaPreview() {
  return (
    <PreviewScaffold>
      {textareaDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TextareaPreview;
