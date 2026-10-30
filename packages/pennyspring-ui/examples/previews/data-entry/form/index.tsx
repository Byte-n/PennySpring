import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { formDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Form',
  description: '字段布局、label 归属、noStyle、依赖与条件渲染、校验反馈；输入控件自动绑定表单状态。',
  order: 1,
  demos: [
    { id: 'basic', title: '基础用法' },
    { id: 'controls', title: '输入组件总览' },
    { id: 'horizontal', title: '水平布局' },
    { id: 'submit', title: '提交与加载态' },
    { id: 'list', title: '动态字段列表' },
    { id: 'validation', title: '校验触发' },
    { id: 'dependencies', title: '字段依赖与条件渲染' },
    { id: 'feedback', title: '校验反馈' },
    { id: 'picker', title: '选择器与展示' },
    { id: 'compound', title: '复合控件隔断' },
  ],
} satisfies PreviewMeta;

export function FormPreview() {
  return (
    <PreviewScaffold>
      {formDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default FormPreview;
