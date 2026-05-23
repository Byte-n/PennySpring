import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { drawerDemos } from './demos';

export function DrawerPreview() {
  return (
    <PreviewScaffold>
      {drawerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DrawerPreview;
