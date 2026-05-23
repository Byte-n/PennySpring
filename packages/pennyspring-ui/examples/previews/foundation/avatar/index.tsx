import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { avatarDemos } from './demos';

export function AvatarPreview() {
  return (
    <PreviewScaffold>
      {avatarDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default AvatarPreview;
