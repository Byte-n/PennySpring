import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tagPickerDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'TagPicker',
  description: '标签式多选，支持隐藏分组、加载与空状态。',
  order: 16,
  demos: [
    { id: 'basic', title: 'Multiple selection and removal' },
    { id: 'hidden', title: 'Hidden selected group' },
    { id: 'sizes', title: 'Sizes' },
    { id: 'states', title: 'Disabled, loading and empty states' },
  ],
} satisfies PreviewMeta;

export function TagPickerPreview() {
  return (
    <PreviewScaffold>
      {tagPickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TagPickerPreview;
