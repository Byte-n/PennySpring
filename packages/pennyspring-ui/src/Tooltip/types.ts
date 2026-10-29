import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  PopoverAlign,
  PopoverCancelParams,
  PopoverOpenChangeParams,
  PopoverOpenChangeReason,
  PopoverPlacement,
} from '../Popover/types';
import type { PortalMountPoint } from '../Portal/types';

export type TooltipVariant = 'dark' | 'light';

export type TooltipAlign = PopoverAlign;

export type TooltipCancelParams = PopoverCancelParams;

export type TooltipOpenChangeParams = PopoverOpenChangeParams;

export type TooltipOpenChangeReason = PopoverOpenChangeReason;

export type TooltipPlacement = PopoverPlacement;

export type TooltipTrigger = 'press' | 'longPress' | 'manual';

export interface TooltipStyles {
  content?: StyleProp<ViewStyle>;
}

export interface TooltipProps {
  mountPoint?: PortalMountPoint;
  children?: ReactNode;
  content?: ReactNode;
  variant?: TooltipVariant;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
  trigger?: TooltipTrigger;
  arrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    params: TooltipOpenChangeParams,
  ) => void;
  onCancel?: (params: TooltipCancelParams) => void;
  style?: StyleProp<ViewStyle>;
  styles?: TooltipStyles;
}
