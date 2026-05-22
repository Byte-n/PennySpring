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
