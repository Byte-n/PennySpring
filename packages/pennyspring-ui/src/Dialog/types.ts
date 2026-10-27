import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';
import type { PopupAnimation, PopupProps } from '../Popup';

export type DialogCancelReason = 'cancel' | 'mask' | 'back';

export type DialogOpenChangeReason = DialogCancelReason | 'ok';

export interface DialogCancelParams {
  reason: DialogCancelReason;
}

export interface DialogOpenChangeParams {
  reason: DialogOpenChangeReason;
}

export interface DialogStyles {
  mask?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  body?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
  cancelButton?: StyleProp<ViewStyle>;
  okButton?: StyleProp<ViewStyle>;
}

export interface DialogProps {
  mountPoint?: PortalMountPoint;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: DialogOpenChangeParams) => void;
  afterOpenChange?: PopupProps['afterOpenChange'];
  onCancel?: (params: DialogCancelParams) => void;
  /** 点击确定；返回 false 或 Promise 拒绝时保持弹窗打开。 */
  onOk?: () => void | boolean | Promise<void | boolean>;
  animation?: PopupAnimation;
  titleText?: string;
  title?: ReactNode;
  cancelText?: string;
  cancel?: ReactNode;
  okText?: string;
  ok?: ReactNode;
  /** 主按钮是否使用危险色实底样式。 */
  okDanger?: boolean;
  okDisabled?: boolean;
  mask?: boolean;
  closeOnMaskClick?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: DialogStyles;
}
