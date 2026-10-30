import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { inputDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Input',
  description: '单行输入、状态、前后缀和清除操作。',
  order: 2,
  demos: [
    { id: 'basic', title: 'Basic' },
    { id: 'size', title: 'Size' },
    { id: 'search', title: 'Search' },
    { id: 'state', title: 'State' },
    { id: 'status', title: 'Floating Label' },
  ],
} satisfies PreviewMeta;

export function InputPreview() {
  return (
    <PreviewScaffold>
      {inputDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default InputPreview;
