import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { messageDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Message',
  description: '消息条组件与 useMessage。',
  order: 2,
  demos: [
    { id: 'types', title: '类型（type）' },
    { id: 'slots', title: '结构组合（slots）' },
    { id: 'placement', title: '定位（placement）' },
  ],
} satisfies PreviewMeta;

export function MessagePreview() {
  return (
    <PreviewScaffold>
      {messageDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default MessagePreview;
