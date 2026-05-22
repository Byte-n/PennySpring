import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';
import type { ComponentSize } from '../shares/types';

export type NotificationType = 'default' | 'success' | 'warning' | 'error' | 'info';
export type NotificationPlacement =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface NotificationStyles {
  content?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  descriptionText?: StyleProp<TextStyle>;
}

export interface NotificationProps {
  mountPoint?: PortalMountPoint;
  open?: boolean;
  defaultOpen?: boolean;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: (open: boolean) => void;
  duration?: number;
  size?: ComponentSize;
  type?: NotificationType;
  placement?: NotificationPlacement;
  titleText?: string;
  title?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: NotificationStyles;
}

export interface NotificationShowOptions {
  onCancel?: () => void;
  duration?: number;
  size?: ComponentSize;
  type?: NotificationType;
  placement?: NotificationPlacement;
  titleText?: string;
  title?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: NotificationStyles;
}

export interface NotificationController {
  show: (options: NotificationShowOptions) => number;
  hide: (key: number) => void;
  clear: () => void;
}
