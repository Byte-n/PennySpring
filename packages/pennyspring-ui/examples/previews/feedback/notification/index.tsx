import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { notificationDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Notification',
  description: '通知卡片组件与 useNotification。',
  order: 3,
  demos: [
    { id: 'types', title: '类型（type）' },
    { id: 'size', title: '尺寸（size）' },
    { id: 'structure', title: '结构组合（slots）' },
    { id: 'placement', title: '定位（placement）' },
  ],
} satisfies PreviewMeta;

export function NotificationPreview() {
  return (
    <PreviewScaffold>
      {notificationDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default NotificationPreview;
