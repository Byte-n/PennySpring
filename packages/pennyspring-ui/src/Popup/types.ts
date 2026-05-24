import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
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
}
export type FloatingPanelStyles = PopupFloatingPanelStyles;

export interface PopupFloatingPanelProps {
  mountPoint?: PortalMountPoint;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: PopupProps['onOpenChange'];
  afterOpenChange?: PopupProps['afterOpenChange'];
  onCancel?: PopupProps['onCancel'];
  mask?: boolean;
  closeOnMaskClick?: boolean;
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
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: PopupFloatingPanelStyles;
}
export type FloatingPanelProps = PopupFloatingPanelProps;
