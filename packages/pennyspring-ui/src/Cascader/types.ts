import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal';
import type {
  PopupAnimation,
  PopupFloatingPanelPosition,
  PopupFloatingPanelStyles,
} from '../Popup';
import type { ComponentSize } from '../shares/types';
import type { TabsStyles } from '../Tabs';
import type { TagDisplayProps } from '../_internal/TagValueDisplay';

export type CascaderValue = string | number;

export type CascaderDisplayMode = 'text' | 'tag';

export interface CascaderOption<TData = unknown> {
  labelText?: string;
  label?: ReactNode;
  value: CascaderValue;
  disabled?: boolean;
  children?: Array<CascaderOption<TData>>;
  data?: TData;
}

export interface CascaderChangeParams<TData = unknown> {
  reason?: 'select' | 'remove';
  option: CascaderOption<TData>;
  value: CascaderValue;
  level: number;
  optionIndex: number;
  path: Array<CascaderOption<TData>>;
  items: Array<CascaderOption<TData> | undefined>;
  isLeaf: boolean;
}

export interface CascaderViewStyles {
  tabs?: TabsStyles;
  list?: StyleProp<ViewStyle>;
  option?: StyleProp<ViewStyle>;
  optionLabel?: StyleProp<TextStyle>;
  empty?: StyleProp<ViewStyle>;
  loading?: StyleProp<ViewStyle>;
}

export interface CascaderViewProps<TData = unknown> {
  size?: ComponentSize;
  options: Array<CascaderOption<TData>>;
  value?: CascaderValue[];
  defaultValue?: CascaderValue[];
  onChange?: (
    value: CascaderValue[],
    params: CascaderChangeParams<TData>,
  ) => void;
  activeLevel?: number;
  defaultActiveLevel?: number;
  onActiveLevelChange?: (level: number) => void;
  tabPlaceholderText?: string;
  emptyText?: string;
  empty?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  renderOptionLabel?: (
    option: CascaderOption<TData>,
    level: number,
    optionIndex: number,
  ) => ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: CascaderViewStyles;
}

export type CascaderOpenChangeReason =
  | 'trigger'
  | 'cancel'
  | 'select';

export interface CascaderOpenChangeParams {
  reason: CascaderOpenChangeReason;
}

export interface CascaderStyles extends CascaderViewStyles {
  trigger?: StyleProp<ViewStyle>;
  valueText?: StyleProp<TextStyle>;
  placeholder?: StyleProp<TextStyle>;
  floatingPanel?: PopupFloatingPanelStyles;
}

export interface CascaderProps<TData = unknown>
  extends Omit<CascaderViewProps<TData>, 'style' | 'styles'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    params: CascaderOpenChangeParams,
  ) => void;
  afterOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  closeOnSelectLeaf?: boolean;
  placeholder?: string;
  mountPoint?: PortalMountPoint;
  mask?: boolean;
  closeOnMaskClick?: boolean;
  animation?: PopupAnimation;
  animationDuration?: number;
  position?: PopupFloatingPanelPosition;
  panelValue?: number;
  defaultPanelValue?: number;
  minHeight?: number;
  maxHeight?: number;
  onPanelChange?: (value: number) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: CascaderStyles;
  displayMode?: CascaderDisplayMode;
  tagProps?: TagDisplayProps;
}
