import { AvatarRoot } from './Avatar';
import { AvatarGroup } from './AvatarGroup';

export {
  AvatarRoot,
  formatAvatarText,
  resolveAvatarDisplayType,
} from './Avatar';
export { AvatarGroup, resolveAvatarGroupMaxCount } from './AvatarGroup';
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
