import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { avatarDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'Avatar',
  description: '头像尺寸、内容类型、叠放、禁用与深色对照。',
  order: 3,
  demos: [
    { id: 'size', title: '尺寸（size）' },
    { id: 'content', title: '内容类型' },
    { id: 'group', title: '叠放（Avatar.Group）' },
    { id: 'states', title: '状态与场景' },
  ],
} satisfies PreviewMeta;

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
