import type { ReactNode } from 'react';
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type AvatarSize = ComponentSize;

export type AvatarShape = 'circle' | 'square';

export interface AvatarStyles {
  image?: StyleProp<ImageStyle>;
  text?: StyleProp<TextStyle>;
  icon?: StyleProp<ViewStyle>;
  rootDisabled?: StyleProp<ViewStyle>;
}

export interface AvatarProps {
  size?: AvatarSize;
  shape?: AvatarShape;
  src?: ImageSourcePropType;
  text?: string;
  icon?: ReactNode;
  onError?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: AvatarStyles;
}

export interface AvatarGroupItem extends AvatarProps {
  key: string;
}

export interface AvatarGroupStyles {
  item?: StyleProp<ViewStyle>;
  rest?: StyleProp<ViewStyle>;
  restText?: StyleProp<TextStyle>;
}

export interface AvatarGroupProps {
  size?: AvatarSize;
  maxCount?: number;
  items?: AvatarGroupItem[];
  style?: StyleProp<ViewStyle>;
  styles?: AvatarGroupStyles;
}
