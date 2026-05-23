import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { actionSheetDemos } from './demos';

export function ActionSheetPreview() {
  return (
    <PreviewScaffold>
      {actionSheetDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default ActionSheetPreview;
