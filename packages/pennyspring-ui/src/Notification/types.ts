import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';
import type { ComponentSize } from '../shares/types';

export type NotificationStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

/** 四角定位收敛为顶部与底部，左右统一 16。 */
export type NotificationPlacement = 'top' | 'bottom';

/** 说明下方的文字操作，最多两个。 */
export interface NotificationAction {
  key?: string;
  text: string;
  onPress: () => void;
}

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
  status?: NotificationStatus;
  placement?: NotificationPlacement;
  /** 图标位。传 null 不渲染底板；缺省按 status 映射。 */
  icon?: ReactNode | null;
  titleText?: string;
  title?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  /** 说明下方的操作，最多取前两个；有操作时不自动关闭。 */
  actions?: NotificationAction[];
  /** 是否显示右上角关闭，默认 true。 */
  closable?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: NotificationStyles;
}

export interface NotificationShowOptions {
  onCancel?: () => void;
  duration?: number;
  size?: ComponentSize;
  status?: NotificationStatus;
  placement?: NotificationPlacement;
  icon?: ReactNode | null;
  titleText?: string;
  title?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  actions?: NotificationAction[];
  closable?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: NotificationStyles;
}

export interface NotificationController {
  show: (options: NotificationShowOptions) => number;
  hide: (key: number) => void;
  clear: () => void;
}
