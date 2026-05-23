import { avatarGroupDemoTitle, AvatarGroupDemo } from './group';
import {
  avatarShapeAndContentDemoTitle,
  AvatarShapeAndContentDemo,
} from './shape-and-content';
import { avatarSizeDemoTitle, AvatarSizeDemo } from './size';

export const avatarDemos = [
  { id: 'group', title: avatarGroupDemoTitle, Component: AvatarGroupDemo },
  {
    id: 'shape-and-content',
    title: avatarShapeAndContentDemoTitle,
    Component: AvatarShapeAndContentDemo,
  },
  { id: 'size', title: avatarSizeDemoTitle, Component: AvatarSizeDemo },
];
