import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { imagePickerDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'ImagePicker',
  description: '图片选择器，支持相册和文件系统来源。',
  order: 4,
  demos: [
    { id: 'basic', title: 'Basic' },
    { id: 'state', title: 'State' },
  ],
} satisfies PreviewMeta;

export function ImagePickerPreview() {
  return (
    <PreviewScaffold>
      {imagePickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ImagePickerPreview;
