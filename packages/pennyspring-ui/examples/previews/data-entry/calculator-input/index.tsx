import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { calculatorInputDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'CalculatorInput',
  description: '表达式录入、即时计算、清空退格和确认操作。',
  order: 5,
  demos: [
    { id: 'basic', title: 'Basic' },
    { id: 'calculator-input-popup', title: 'Popup' },
    { id: 'controlled', title: 'Controlled' },
    { id: 'state', title: 'State' },
  ],
} satisfies PreviewMeta;

export function CalculatorInputPreview() {
  return (
    <PreviewScaffold>
      {calculatorInputDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default CalculatorInputPreview;
