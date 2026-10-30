import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { progressDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Progress',
  description: '条形与圆环进度、状态、信息位与尺寸。',
  order: 12,
  demos: [
    { id: 'bar', title: '条形（Progress.Bar）' },
    { id: 'states', title: '状态与信息位' },
    { id: 'circle', title: '圆环（Progress.Circle）' },
    { id: 'dark', title: '深色对照' },
  ],
} satisfies PreviewMeta;

export function ProgressPreview() {
  return (
    <PreviewScaffold>
      {progressDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ProgressPreview;
