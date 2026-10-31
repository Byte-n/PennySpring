import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { imageDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Image',
  description: '图片展示、失败重试与 Image.PreviewGroup 全屏预览。',
  order: 10,
  demos: [
    { id: 'basic', title: '基础与尺寸' },
    { id: 'group', title: '预览组' },
    { id: 'states', title: '失败与只读' },
  ],
} satisfies PreviewMeta;

export function ImagePreview() {
  return (
    <PreviewScaffold>
      {imageDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ImagePreview;
