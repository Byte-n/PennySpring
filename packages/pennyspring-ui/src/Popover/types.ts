import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export type PopoverAlign = 'start' | 'center' | 'end';

export type PopoverTrigger = 'click' | 'longPress' | 'manual';

export type PopoverOpenChangeReason = 'trigger' | 'outside' | 'back';

export interface PopoverOpenChangeParams {
  reason: PopoverOpenChangeReason;
}

export interface PopoverCancelParams {
  reason: PopoverOpenChangeReason;
}

export interface PopoverStyles {
  content?: StyleProp<ViewStyle>;
}

export interface PopoverProps {
  mountPoint?: PortalMountPoint;
  children?: ReactNode;
  content?: ReactNode;
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  trigger?: PopoverTrigger;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PopoverOpenChangeParams) => void;
  afterOpenChange?: (open: boolean) => void;
  onCancel?: (params: PopoverCancelParams) => void;
  closeOnMaskClick?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: PopoverStyles;
}
