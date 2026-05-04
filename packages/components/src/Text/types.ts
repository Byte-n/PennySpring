import type { ReactNode } from 'react';
import type { TextProps as RNTextProps } from 'react-native';

export type TextSize = 'sm' | 'md' | 'lg' | 'xl' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export interface TextProps extends RNTextProps {
  size?: TextSize;
  children?: ReactNode;
}