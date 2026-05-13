import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';
import type { ComponentSize } from '../shares/types';

export type ToastPlacement = 'top' | 'center' | 'bottom';

export interface ToastStyles {
  content?: StyleProp<ViewStyle>;
  messageText?: StyleProp<TextStyle>;
}

export interface ToastProps {
  open?: boolean;
  defaultOpen?: boolean;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: (open: boolean) => void;
  duration?: number;
  size?: ComponentSize;
  placement?: ToastPlacement;
  messageText?: string;
  message?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ToastStyles;
  mountPoint?: PortalMountPoint;
}

export interface ToastShowOptions {
  onCancel?: () => void;
  duration?: number;
  size?: ComponentSize;
  placement?: ToastPlacement;
  messageText?: string;
  message?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ToastStyles;
}

export interface ToastController {
  show: (options: ToastShowOptions) => number;
  hide: (key: number) => void;
  clear: () => void;
}
