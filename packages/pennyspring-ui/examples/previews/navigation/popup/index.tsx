import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { popupDemos } from './demos';

export function PopupPreview() {
  return (
    <PreviewScaffold>
      {popupDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default PopupPreview;
