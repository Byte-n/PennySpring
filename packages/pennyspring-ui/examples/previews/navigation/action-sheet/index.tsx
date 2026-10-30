import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { actionSheetDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'ActionSheet',
  description: '底部动作面板、动作回调和关闭行为。',
  order: 3,
  demos: [
    { id: 'event-feedback', title: 'Event feedback' },
    { id: 'open-and-actions', title: 'Open and actions' },
  ],
} satisfies PreviewMeta;

export function ActionSheetPreview() {
  return (
    <PreviewScaffold>
      {actionSheetDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ActionSheetPreview;
