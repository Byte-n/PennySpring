import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';
import type { ComponentSize } from '../shares/types';

export type MessageType = 'default' | 'success' | 'warning' | 'error' | 'info';
export type MessagePlacement = 'top' | 'bottom';

export interface MessageStyles {
  content?: StyleProp<ViewStyle>;
  messageText?: StyleProp<TextStyle>;
}

export interface MessageProps {
  open?: boolean;
  defaultOpen?: boolean;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: (open: boolean) => void;
  duration?: number;
  size?: ComponentSize;
  type?: MessageType;
  placement?: MessagePlacement;
  messageText?: string;
  message?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: MessageStyles;
  mountPoint?: PortalMountPoint;
}

export interface MessageShowOptions {
  onCancel?: () => void;
  duration?: number;
  size?: ComponentSize;
  type?: MessageType;
  placement?: MessagePlacement;
  messageText?: string;
  message?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: MessageStyles;
}

export interface MessageController {
  show: (options: MessageShowOptions) => number;
  hide: (key: number) => void;
  clear: () => void;
}
