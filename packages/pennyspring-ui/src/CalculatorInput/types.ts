import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PopupCancelParams } from '../Popup/types';

export interface CalculatorInputOkParams {
  /** Current expression shown in the input display. */
  expression: string;

  /** Evaluated numeric result. */
  result: number;
}

export interface CalculatorInputStyles {
  /** Display shell style. */
  display?: StyleProp<ViewStyle>;

  /** Expression input text style. */
  input?: StyleProp<TextStyle>;

  /** Result text style. */
  result?: StyleProp<TextStyle>;

  /** Keypad wrapper style. */
  keypad?: StyleProp<ViewStyle>;

  /** Key button style shared by all keys. */
  key?: StyleProp<ViewStyle>;

  /** Key text style shared by all keys. */
  keyText?: StyleProp<TextStyle>;

  /** Confirm button style. */
  okKey?: StyleProp<ViewStyle>;

  /** Confirm button text style. */
  okKeyText?: StyleProp<TextStyle>;
}

export interface CalculatorInputProps {
  /**
   * Controlled expression value.
   */
  value?: string;

  /**
   * Initial expression value for uncontrolled usage.
   */
  defaultValue?: string;

  /**
   * Called when the expression changes.
   */
  onChange?: (value: string) => void;

  /**
   * Called by the confirm key when the expression can be evaluated.
   */
  onOk?: (params: CalculatorInputOkParams) => void;

  /**
   * Placeholder shown while expression is empty.
   */
  placeholder?: string;

  /**
   * Disabled inputs cannot be edited or confirmed.
   */
  disabled?: boolean;

  /**
   * Readonly inputs cannot be edited or confirmed but keep normal readability.
   */
  readonly?: boolean;

  /**
   * Root style. Only controls outer layout.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Stable slot style overrides.
   */
  styles?: CalculatorInputStyles;
}

export interface CalculatorInputPopupProps
  extends Pick<
    CalculatorInputProps,
    'value' | 'defaultValue' | 'onChange' | 'onOk' | 'placeholder' | 'disabled' | 'readonly' | 'styles'
  > {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: (params: PopupCancelParams) => void;
  style?: StyleProp<ViewStyle>;
}

export interface UseCalculatorValueStateOptions {
  /**
   * 每次打开弹层时回填到表达式的初始值。
   */
  initialValue?: string;

  /**
   * 非受控模式下弹层的初始展开状态。
   */
  defaultOpen?: boolean;

  /**
   * 受控模式下弹层的展开状态。
   */
  open?: boolean;

  /**
   * 弹层展开状态变化回调。
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * 表达式变化回调。
   */
  onChange?: (value: string) => void;

  /**
   * 按确认键且表达式可计算时触发。
   */
  onOk?: (params: CalculatorInputOkParams) => void;
}

export interface CalculatorValueState {
  /**
   * 弹层是否展开。
   */
  isOpen: boolean;

  /**
   * 当前表达式。
   */
  value: string;

  /**
   * 展开弹层，并把表达式重置为 initialValue。
   */
  open: () => void;

  /**
   * 收起弹层。
   */
  close: () => void;

  /**
   * 同步弹层展开状态，供 CalculatorInput.Popup 的 onOpenChange 使用。
   */
  setOpen: (open: boolean) => void;

  /**
   * 更新表达式，供 CalculatorInput.Popup 的 onChange 使用。
   */
  setValue: (value: string) => void;

  /**
   * 处理确认，供 CalculatorInput.Popup 的 onOk 使用。
   */
  handleOk: (params: CalculatorInputOkParams) => void;
}
