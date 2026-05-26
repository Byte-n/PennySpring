import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { PortalMountPoint } from '../Portal/types';

export type PopupPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export type PopupAnimation = 'none' | 'slide' | 'fade';

export type PopupCancelReason = 'mask' | 'back';

export type PopupOpenChangeReason = PopupCancelReason;

export interface PopupCancelParams {
  reason: PopupCancelReason;
}

export interface PopupOpenChangeParams {
  reason: PopupOpenChangeReason;
}

export interface PopupStyles {
  mask?: StyleProp<ViewStyle>;
  body?: StyleProp<ViewStyle>;
}

export interface PopupProps {
  mountPoint?: PortalMountPoint;
  position?: PopupPosition;
  animation?: PopupAnimation;
  animationDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PopupOpenChangeParams) => void;
  afterOpenChange?: (open: boolean) => void;
  onCancel?: (params: PopupCancelParams) => void;
  mask?: boolean;
  closeOnMaskClick?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: PopupStyles;
}

export type PopupFloatingPanelPosition = 'top' | 'bottom';
export type FloatingPanelPosition = PopupFloatingPanelPosition;
export type PopupFloatingPanelHeight = number | `${number}%`;

export interface PopupFloatingPanelStyles extends PopupStyles {
  content?: StyleProp<ViewStyle>;
  handle?: StyleProp<ViewStyle>;
  handleIndicator?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  panelBody?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
  cancelButton?: StyleProp<ViewStyle>;
  okButton?: StyleProp<ViewStyle>;
}
export type FloatingPanelStyles = PopupFloatingPanelStyles;

export interface PopupFloatingPanelRenderHeaderParams {
  cancel: () => void;
  confirm: () => Promise<void>;
}

export interface PopupFloatingPanelRenderFooterParams {
  cancel: () => void;
  confirm: () => Promise<void>;
  okDisabled: boolean;
  okLoading: boolean;
}

export type PopupFloatingPanelOkHandler = () =>
  | void
  | boolean
  | Promise<void | boolean>;

export interface PopupFloatingPanelProps {
  mountPoint?: PortalMountPoint;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: PopupProps['afterOpenChange'];
  onCancel?: () => void;
  onOk?: PopupFloatingPanelOkHandler;
  mask?: boolean;
  closeOnMaskClick?: boolean;
  closeOnCancel?: boolean;
  closeOnOk?: boolean;
  animation?: PopupAnimation;
  animationDuration?: number;
  position?: PopupFloatingPanelPosition;
  keyboardAvoiding?: boolean;
  size?: ComponentSize;
  height?: PopupFloatingPanelHeight;
  value?: number;
  defaultValue?: number;
  minHeight?: PopupFloatingPanelHeight;
  maxHeight?: PopupFloatingPanelHeight;
  onChange?: (value: number) => void;
  titleText?: string;
  title?: ReactNode;
  header?: ReactNode;
  renderHeader?: ((params: PopupFloatingPanelRenderHeaderParams) => ReactNode) | null;
  cancelText?: string;
  cancel?: ReactNode;
  okText?: string;
  ok?: ReactNode;
  okDisabled?: boolean;
  okLoading?: boolean;
  footer?: ReactNode;
  renderFooter?: ((params: PopupFloatingPanelRenderFooterParams) => ReactNode) | null;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: PopupFloatingPanelStyles;
}
export type FloatingPanelProps = PopupFloatingPanelProps;
