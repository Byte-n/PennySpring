import type { ReactNode } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

export type StickyPlacement = 'top' | 'bottom';

export interface StickyStyles {
  root?: StyleProp<ViewStyle>;
}

export interface StickyLayoutStyles {
  root?: StyleProp<ViewStyle>;
  overlay?: StyleProp<ViewStyle>;
}

export interface StickyProps {
  children?: ReactNode;
  disabled?: boolean;
  offset?: number;
  onChange?: (affixed: boolean) => void;
  placement?: StickyPlacement;
  style?: StyleProp<ViewStyle>;
  styles?: StickyStyles;
  testID?: string;
}

export interface StickyLayoutProps {
  children?: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
  styles?: StickyLayoutStyles;
  testID?: string;
}
