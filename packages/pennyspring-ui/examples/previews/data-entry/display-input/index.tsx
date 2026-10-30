import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { displayInputDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'DisplayInput',
  description: '可点击展示输入风格内容，无光标，支持 inline 与 block 布局。',
  order: 3,
  demos: [
    { id: 'basic', title: 'Basic' },
    { id: 'size', title: 'Size' },
    { id: 'display', title: 'Display' },
    { id: 'state', title: 'State' },
    { id: 'value-text', title: 'Value text' },
    { id: 'custom-value-node', title: 'Custom value node' },
    { id: 'overflow', title: 'Overflow hidden (default)' },
    { id: 'overflow-visible', title: 'Overflow visible' },
  ],
} satisfies PreviewMeta;

export function DisplayInputPreview() {
  return (
    <PreviewScaffold>
      {displayInputDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DisplayInputPreview;
