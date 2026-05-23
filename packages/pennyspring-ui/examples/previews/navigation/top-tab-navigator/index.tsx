import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { topTabNavigatorDemos } from './demos';

export function TopTabNavigatorPreview() {
  return (
    <PreviewScaffold>
      {topTabNavigatorDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TopTabNavigatorPreview;
