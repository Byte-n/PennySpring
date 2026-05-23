import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { notificationDemos } from './demos';

export function NotificationPreview() {
  return (
    <PreviewScaffold>
      {notificationDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default NotificationPreview;
