import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { messageDemos } from './demos';

export function MessagePreview() {
  return (
    <PreviewScaffold>
      {messageDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default MessagePreview;
