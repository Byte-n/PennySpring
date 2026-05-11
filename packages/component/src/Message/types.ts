import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export type MessageSize = ComponentSize;

export interface MessageStyles {
  icon?: StyleProp<ViewStyle>;
  contentText?: StyleProp<TextStyle>;
  body?: StyleProp<ViewStyle>;
  closeButton?: StyleProp<ViewStyle>;
}

export interface MessageProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  type?: MessageType;
  duration?: number;
  icon?: ReactNode;
  content?: ReactNode;
  contentText?: string;
  closeable?: boolean;
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  styles?: MessageStyles;
  size?: MessageSize;
}

export interface MessageShowOptions {
  type?: MessageType;
  duration?: number;
  icon?: ReactNode;
  content?: ReactNode;
  contentText?: string;
  closeable?: boolean;
  onCancel?: () => void;
  size?: MessageSize;
}

export interface MessageStaticMethods {
  show: (options: MessageShowOptions) => void;
  success: (options: MessageShowOptions) => void;
  warning: (options: MessageShowOptions) => void;
  error: (options: MessageShowOptions) => void;
  info: (options: MessageShowOptions) => void;
  clear: () => void;
}
