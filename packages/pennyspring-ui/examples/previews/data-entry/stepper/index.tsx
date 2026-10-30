import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { stepperDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Stepper',
  description: '步进器加减、范围限制、尺寸、单位与禁用状态。',
  order: 11,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'states', title: '状态' },
    { id: 'composition', title: '单位与整行组合' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function StepperPreview() {
  return (
    <PreviewScaffold>
      {stepperDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default StepperPreview;
