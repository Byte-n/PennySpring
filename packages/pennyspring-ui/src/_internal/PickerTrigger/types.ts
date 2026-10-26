import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  DisplayInputOverflow,
  DisplayInputProps,
  DisplayInputStyles,
} from '../../DisplayInput';
import type { InputStatus } from '../../Input';
import type { ComponentSize } from '../../shares/types';

/**
 * 触发器类组件共用的 DisplayInput 槽位样式。
 * root 对应 DisplayInput 根节点，其余槽位与 DisplayInputStyles 保持一致。
 */
export interface PickerInputStyles extends DisplayInputStyles {
  root?: StyleProp<ViewStyle>;
}

/**
 * 触发器类组件统一接管的 DisplayInput 配置。
 * 受控状态、尺寸、字段文案、校验信息与样式由外层组件持有，不通过该配置覆盖。
 */
export type PickerDisplayInputProps = Omit<
  DisplayInputProps,
  | 'children'
  | 'disabled'
  | 'error'
  | 'errorText'
  | 'helper'
  | 'helperText'
  | 'label'
  | 'labelText'
  | 'onPress'
  | 'readonly'
  | 'size'
  | 'status'
  | 'style'
  | 'styles'
  | 'valueText'
>;

export interface PickerTriggerProps {
  /** 触发器是否处于展开态，用于表达下划线激活色。 */
  active?: boolean;
  /** 是否展示清除按钮。 */
  allowClear?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  displayInputProps?: PickerDisplayInputProps;
  error?: ReactNode | null;
  errorText?: string;
  externalInputStyles?: PickerInputStyles;
  externalTriggerStyle?: StyleProp<ViewStyle>;
  hasValue?: boolean;
  helper?: ReactNode | null;
  helperText?: string;
  label?: ReactNode | null;
  onClearPress?: () => void;
  onPress?: () => void;
  overflow?: DisplayInputOverflow;
  prefix?: ReactNode;
  readonly?: boolean;
  size?: ComponentSize;
  status?: InputStatus;
  suffix?: ReactNode;
  valueText?: string;
}
