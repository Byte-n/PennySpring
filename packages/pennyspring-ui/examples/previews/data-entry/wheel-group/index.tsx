import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { wheelGroupDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'WheelGroup',
  description: '滚轮组内核、容器高度自适应与禁用态。',
  order: 18,
  demos: [
    { id: 'basic', title: 'Time wheel (HH:mm:ss)' },
    { id: 'fit-container', title: 'Container height' },
    { id: 'state', title: 'Disabled items' },
  ],
} satisfies PreviewMeta;

export function WheelGroupPreview() {
  return (
    <PreviewScaffold>
      {wheelGroupDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default WheelGroupPreview;
