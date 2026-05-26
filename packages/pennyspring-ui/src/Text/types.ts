import type { ReactNode } from 'react';
import type { GestureResponderEvent, StyleProp, TextStyle } from 'react-native';
import type { AliasColorTokenKey } from '@pennyspring/theme';

export type TextSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5';
export type TextWeight =
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'strong';
export type TextSemanticColor =
  | 'base'
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'heading'
  | 'label'
  | 'description'
  | 'disabled'
  | 'placeholder'
  | 'lightSolid';
export type TextColor = TextSemanticColor | AliasColorTokenKey | (string & {});

export interface TextProps {
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  selectable?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  testID?: string;
  children?: ReactNode;
}
