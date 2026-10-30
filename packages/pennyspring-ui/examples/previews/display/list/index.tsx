import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { listDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'List',
  description: '列表容器、列表项和分割线。',
  order: 3,
  demos: [
    { id: 'rows', title: '行结构（8 种）' },
    { id: 'amount', title: '金额样式（tone）' },
    { id: 'collapsible', title: '分组头与分隔线' },
    { id: 'states', title: '空态、加载与加载更多' },
  ],
} satisfies PreviewMeta;

export function ListPreview() {
  return (
    <PreviewScaffold>
      {listDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ListPreview;
