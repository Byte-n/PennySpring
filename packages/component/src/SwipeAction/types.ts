import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SwipeActionSize = ComponentSize;

export type SwipeActionSide = 'left' | 'right';

export type SwipeActionValue = SwipeActionSide | null;

export type SwipeActionColor =
  | 'light'
  | 'weak'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export interface SwipeActionAction {
  key: string | number;
  text?: string;
  content?: ReactNode;
  color?: SwipeActionColor;
  backgroundColor?: string;
  disabled?: boolean;
  onPress?: () => void;
}

export interface SwipeActionStyles {
  content?: StyleProp<ViewStyle>;
  track?: StyleProp<ViewStyle>;
  leftActions?: StyleProp<ViewStyle>;
  rightActions?: StyleProp<ViewStyle>;
  action?: StyleProp<ViewStyle>;
  actionText?: StyleProp<TextStyle>;
}

export interface SwipeActionProps
  extends Omit<ViewProps, 'style' | 'children'> {
  size?: SwipeActionSize;
  value?: SwipeActionValue;
  defaultValue?: SwipeActionValue;
  onChange?: (value: SwipeActionValue) => void;
  leftActions?: SwipeActionAction[];
  rightActions?: SwipeActionAction[];
  closeOnAction?: boolean;
  onAction?: (action: SwipeActionAction, index: number, side: SwipeActionSide) => void;
  onActionsReveal?: (side: SwipeActionSide) => void;
  onCancel?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: SwipeActionStyles;
}

export interface SwipeActionRef {
  close: () => void;
  show: (side?: SwipeActionSide) => void;
}
