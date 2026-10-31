import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { listDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'List',
  description: '默认不滚动的数据列表，支持行级滑动操作、状态与分组。',
  order: 3,
  demos: [
    { id: 'rows', title: '行结构（8 种）' },
    { id: 'right', title: '行尾自定义内容（right）' },
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
