import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { pickerDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Picker',
  description: '单列、多列、默认打开与空状态，含 Picker.Cascader 级联子模式。',
  order: 14,
  demos: [
    { id: 'basic', title: 'Basic' },
    { id: 'controlled', title: 'Controlled' },
    { id: 'popup-props', title: 'Popup props' },
    { id: 'state', title: 'State' },
    { id: 'cascader-basic', title: 'Cascader / 基础用法' },
    { id: 'cascader-controlled', title: 'Cascader / 受控模式' },
    { id: 'cascader-state', title: 'Cascader / 状态与自定义' },
  ],
} satisfies PreviewMeta;

export function PickerPreview() {
  return (
    <PreviewScaffold>
      {pickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default PickerPreview;
