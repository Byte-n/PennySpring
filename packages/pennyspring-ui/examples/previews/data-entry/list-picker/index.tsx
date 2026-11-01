import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { listPickerDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'ListPicker',
  description:
    '基于 List 行的搜索、分组与单选/多选，含 ListPicker.Cascader 级联子模式。',
  order: 15,
  demos: [
    { id: 'single', title: 'Single selection and search' },
    { id: 'multiple', title: 'Multiple selection and tags' },
    { id: 'grouped', title: 'Grouped options' },
    { id: 'states', title: 'Disabled, readonly and validation' },
    { id: 'cascader-basic', title: 'Cascader / 基础用法' },
    { id: 'cascader-trigger', title: 'Cascader / 触发器状态' },
  ],
} satisfies PreviewMeta;

export function ListPickerPreview() {
  return (
    <PreviewScaffold>
      {listPickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ListPickerPreview;
