import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type ToastType = 'info' | 'success' | 'fail';

export type ToastPosition = 'top' | 'center' | 'bottom';

export type ToastSize = ComponentSize;

export interface ToastStyles {
  body?: StyleProp<ViewStyle>;
  icon?: StyleProp<ViewStyle>;
  contentText?: StyleProp<TextStyle>;
}

export interface ToastProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  type?: ToastType;
  position?: ToastPosition;
  duration?: number;
  mask?: boolean;
  icon?: ReactNode;
  content?: ReactNode;
  contentText?: string;
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  styles?: ToastStyles;
  size?: ToastSize;
}

export interface ToastShowOptions {
  type?: ToastType;
  position?: ToastPosition;
  duration?: number;
  mask?: boolean;
  icon?: ReactNode;
  content?: ReactNode;
  contentText?: string;
  onCancel?: () => void;
  size?: ToastSize;
}

export interface ToastStaticMethods {
  show: (options: ToastShowOptions) => void;
  success: (options: ToastShowOptions) => void;
  fail: (options: ToastShowOptions) => void;
  info: (options: ToastShowOptions) => void;
  clear: () => void;
}
