import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { calculatorInputDemos } from './demos';

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
