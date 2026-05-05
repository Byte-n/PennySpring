import type { ReactNode } from 'react';
import type { TextProps as RNTextProps } from 'react-native';

export type TextSize = 'sm' | 'md' | 'lg' | 'xl' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
export type TextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'strong';
export type TextColor =
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

export interface TextProps extends RNTextProps {
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  children?: ReactNode;
}
