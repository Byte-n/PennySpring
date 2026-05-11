import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationSize = ComponentSize;

export interface NotificationStyles {
  icon?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  body?: StyleProp<ViewStyle>;
  contentText?: StyleProp<TextStyle>;
  descriptionText?: StyleProp<TextStyle>;
  closeButton?: StyleProp<ViewStyle>;
}

export interface NotificationProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  type?: NotificationType;
  duration?: number;
  icon?: ReactNode;
  titleText?: string;
  title?: ReactNode;
  contentText?: string;
  content?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  closeable?: boolean;
  onCancel?: () => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  styles?: NotificationStyles;
  size?: NotificationSize;
}

export interface NotificationOpenOptions {
  type?: NotificationType;
  duration?: number;
  icon?: ReactNode;
  titleText?: string;
  title?: ReactNode;
  contentText?: string;
  content?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  closeable?: boolean;
  onCancel?: () => void;
  onPress?: () => void;
  size?: NotificationSize;
}

export interface NotificationStaticMethods {
  open: (options: NotificationOpenOptions) => void;
  success: (options: NotificationOpenOptions) => void;
  warning: (options: NotificationOpenOptions) => void;
  error: (options: NotificationOpenOptions) => void;
  info: (options: NotificationOpenOptions) => void;
  clear: () => void;
}
