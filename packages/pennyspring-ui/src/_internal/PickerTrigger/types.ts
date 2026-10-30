import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  DisplayInputOverflow,
  DisplayInputProps,
} from '../../DisplayInput';
import type { InputStatus } from '../../Input';
import type { ComponentSize } from '../../shares/types';
import type { TriggerFieldStyles } from '../../shares/pickerStyles';

/**
 * 触发器类组件统一接管的 DisplayInput 配置。
 * 受控状态、尺寸、字段文案、校验信息与样式由外层组件持有，不通过该配置覆盖。
 */
export type PickerDisplayInputProps = Omit<
  DisplayInputProps,
  | 'children'
  | 'disabled'
  | 'label'
  | 'labelText'
  | 'onPress'
  | 'placeholder'
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
  externalInputStyles?: TriggerFieldStyles;
  externalTriggerStyle?: StyleProp<ViewStyle>;
  hasValue?: boolean;
  label?: ReactNode | null;
  onClearPress?: () => void;
  onPress?: () => void;
  overflow?: DisplayInputOverflow;
  placeholder?: string;
  prefix?: ReactNode;
  readonly?: boolean;
  size?: ComponentSize;
  status?: InputStatus;
  suffix?: ReactNode;
  valueText?: string;
}
