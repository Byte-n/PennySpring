import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { sliderDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Slider',
  description: '滑块范围、步长、尺寸、状态与数值标注。',
  order: 10,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态' },
    { id: 'annotations', title: '数值标注' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function SliderPreview() {
  return (
    <PreviewScaffold>
      {sliderDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default SliderPreview;
