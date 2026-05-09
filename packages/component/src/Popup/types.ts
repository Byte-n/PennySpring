import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type PopupSize = ComponentSize;

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
  size?: PopupSize;
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
