import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { toastDemos } from './demos';

export function ToastPreview() {
  return (
    <PreviewScaffold>
      {toastDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ToastPreview;
