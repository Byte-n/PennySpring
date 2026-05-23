import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { dialogDemos } from './demos';

export function DialogPreview() {
  return (
    <PreviewScaffold>
      {dialogDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DialogPreview;
