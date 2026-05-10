import type { AliasColorTokenKey } from '@pennyspring/theme';
import type { Icon, IconWeight } from 'phosphor-react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type IconSize = ComponentSize | number;

export type IconColor = AliasColorTokenKey | string;

export type IconName =
  | 'add'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'calendar'
  | 'caret-down'
  | 'caret-left'
  | 'caret-right'
  | 'caret-up'
  | 'check'
  | 'check-circle'
  | 'close'
  | 'close-circle'
  | 'download'
  | 'edit'
  | 'eye'
  | 'eye-slash'
  | 'filter'
  | 'heart'
  | 'home'
  | 'info'
  | 'list'
  | 'minus'
  | 'more'
  | 'notification'
  | 'plus'
  | 'search'
  | 'settings'
  | 'share'
  | 'star'
  | 'trash'
  | 'upload'
  | 'user'
  | 'warning';

export interface IconProps {
  icon: IconName | Icon;
  size?: IconSize;
  color?: IconColor;
  weight?: IconWeight;
  duotoneColor?: IconColor;
  duotoneOpacity?: number;
  mirrored?: boolean;
  style?: StyleProp<ViewStyle | Omit<TextStyle, 'cursor'>>;
  testID?: string;
}
