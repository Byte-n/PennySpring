import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PopupProps } from '../Popup';
import type { ComponentSize } from '../shares/types';

export type DialogSize = ComponentSize;

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
  size?: DialogSize;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: DialogOpenChangeParams) => void;
  afterOpenChange?: PopupProps['afterOpenChange'];
  onCancel?: (params: DialogCancelParams) => void;
  onOk?: () => void;
  titleText?: string;
  title?: ReactNode;
  cancelText?: string;
  cancel?: ReactNode;
  okText?: string;
  ok?: ReactNode;
  okDisabled?: boolean;
  mask?: boolean;
  closeOnMaskClick?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: DialogStyles;
}
