import { AvatarRoot } from './Avatar';
import { AvatarGroup } from './AvatarGroup';

export { AvatarRoot } from './Avatar';
export { AvatarGroup } from './AvatarGroup';
export type {
  AvatarGroupItem,
  AvatarGroupProps,
  AvatarGroupStyles,
  AvatarProps,
  AvatarShape,
  AvatarStyles,
} from './types';

export const Avatar = Object.assign(AvatarRoot, {
  Group: AvatarGroup,
});
