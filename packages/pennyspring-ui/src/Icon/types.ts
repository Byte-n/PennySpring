import type { AliasColorTokenKey } from '@pennyspring/theme';
import type { IconProps as PhosphorIconProps, IconWeight } from 'phosphor-react-native';
import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type IconSize = ComponentSize | number;

export type IconColor = AliasColorTokenKey | string;
export type IconComponent = ComponentType<PhosphorIconProps>;

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
  icon: IconName | IconComponent;
  size?: IconSize;
  color?: IconColor;
  weight?: IconWeight;
  duotoneColor?: IconColor;
  duotoneOpacity?: number;
  mirrored?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
