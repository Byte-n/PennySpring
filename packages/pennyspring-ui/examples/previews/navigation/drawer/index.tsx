import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { drawerDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Drawer',
  description: '抽屉容器和页面侧滑。',
  order: 1,
  demos: [
    { id: 'controlled', title: 'Controlled' },
    { id: 'embedded-layout', title: 'Embedded layout' },
    { id: 'width', title: 'Width' },
  ],
} satisfies PreviewMeta;

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
