import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';
import type { PopupProps } from '../Popup';

export interface ActionSheetAction {
  text: string;
  description?: string;
  danger?: boolean;
  disabled?: boolean;
}

export type ActionSheetCancelReason = 'cancel' | 'mask' | 'back';

export type ActionSheetOpenChangeReason = ActionSheetCancelReason | 'action';

export interface ActionSheetCancelParams {
  reason: ActionSheetCancelReason;
}

export interface ActionSheetOpenChangeParams {
  reason: ActionSheetOpenChangeReason;
}

export interface ActionSheetStyles {
  mask?: StyleProp<ViewStyle>;
  body?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  actionText?: StyleProp<TextStyle>;
  actionDescription?: StyleProp<TextStyle>;
  cancelButtonText?: StyleProp<TextStyle>;
}

export interface ActionSheetProps {
  mountPoint?: PortalMountPoint;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: ActionSheetOpenChangeParams) => void;
  afterOpenChange?: PopupProps['afterOpenChange'];
  onCancel?: (params: ActionSheetCancelParams) => void;
  onAction?: (action: ActionSheetAction, index: number) => void;
  actions: ActionSheetAction[];
  titleText?: string;
  title?: ReactNode;
  cancelText?: string;
  cancel?: ReactNode;
  mask?: boolean;
  closeOnMaskClick?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: ActionSheetStyles;
}
