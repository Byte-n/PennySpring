import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { badgeDemos } from './demos';

export function BadgePreview() {
  return (
    <PreviewScaffold>
      {badgeDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default BadgePreview;
