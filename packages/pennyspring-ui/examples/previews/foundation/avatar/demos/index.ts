import {
  avatarContentDemoTitle,
  AvatarContentDemo,
} from './content';
import { avatarGroupDemoTitle, AvatarGroupDemo } from './group';
import { avatarSizeDemoTitle, AvatarSizeDemo } from './size';
import { avatarStatesDemoTitle, AvatarStatesDemo } from './states';

export const avatarDemos = [
  { id: 'size', title: avatarSizeDemoTitle, Component: AvatarSizeDemo },
  { id: 'content', title: avatarContentDemoTitle, Component: AvatarContentDemo },
  { id: 'group', title: avatarGroupDemoTitle, Component: AvatarGroupDemo },
  { id: 'states', title: avatarStatesDemoTitle, Component: AvatarStatesDemo },
];
