import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { tabBarDemos } from './demos';

export function TabBarPreview() {
  return (
    <PreviewScaffold>
      {tabBarDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TabBarPreview;
