import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';

export type MessageStatus = 'default' | 'success' | 'warning' | 'error' | 'info';
export type MessagePlacement = 'top' | 'bottom';

/** 正文末尾的唯一操作，例如撤销、重试、查看。 */
export interface MessageAction {
  text: string;
  onPress: () => void;
}

export interface MessageStyles {
  content?: StyleProp<ViewStyle>;
  messageText?: StyleProp<TextStyle>;
  action?: StyleProp<TextStyle>;
}

export interface MessageProps {
  open?: boolean;
  defaultOpen?: boolean;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: (open: boolean) => void;
  duration?: number;
  status?: MessageStatus;
  placement?: MessagePlacement;
  /** 左侧 16 图标位。传 null 不渲染，缺省按 status 映射。 */
  icon?: ReactNode | null;
  /** 正文末尾操作，最多一个；有操作时常驻不自动关闭。 */
  action?: MessageAction;
  /** 是否显示关闭按钮，默认 true。 */
  closable?: boolean;
  messageText?: string;
  message?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: MessageStyles;
  mountPoint?: PortalMountPoint;
}

export interface MessageShowOptions {
  onCancel?: () => void;
  duration?: number;
  status?: MessageStatus;
  placement?: MessagePlacement;
  icon?: ReactNode | null;
  action?: MessageAction;
  closable?: boolean;
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
