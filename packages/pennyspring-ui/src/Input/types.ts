import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

/**
 * Input size semantic.
 */

/**
 * Input validation display status.
 */
export type InputStatus = 'default' | 'error' | 'warning' | 'success';

export interface InputStyles {
  /** Label text style. */
  labelText?: StyleProp<TextStyle>;

  /** Field shell style. */
  field?: StyleProp<ViewStyle>;

  /** TextInput text style. */
  input?: StyleProp<TextStyle>;

  /** Prefix container style. */
  prefix?: StyleProp<ViewStyle>;

  /** Suffix container style. */
  suffix?: StyleProp<ViewStyle>;

  /** Helper text style. */
  helper?: StyleProp<TextStyle>;

  /** Error text style. */
  error?: StyleProp<TextStyle>;

  /** Clear button container style. */
  clearButton?: StyleProp<ViewStyle>;
}

export interface InputProps
  extends Omit<
    TextInputProps,
    | 'defaultValue'
    | 'editable'
    | 'onChange'
    | 'onChangeText'
    | 'placeholder'
    | 'style'
    | 'value'
  > {
  /**
   * Input size. Defaults to normal.
   */
  size?: ComponentSize;

  /**
   * Initial uncontrolled field value.
   */
  defaultValue?: string;

  /**
   * Controlled field value.
   */
  value?: string;

  /**
   * Called when the field value changes.
   */
  onChange?: (value: string) => void;

  /**
   * Field label text. Placeholder must not replace label.
   */
  labelText?: string;

  /**
   * Custom label node. Pass null to suppress label rendering.
   */
  label?: ReactNode | null;

  /**
   * Placeholder shown while the input is empty.
   */
  placeholder?: string;

  /**
   * Helper text shown near the field.
   */
  helperText?: string;

  /**
   * Helper custom node. Pass null to suppress helper rendering.
   */
  helper?: ReactNode | null;

  /**
   * Error text shown only when status is error.
   */
  errorText?: string;

  /**
   * Error custom node. Pass null to suppress error rendering.
   */
  error?: ReactNode | null;

  /**
   * Required semantic marker. Does not run validation.
   */
  required?: boolean;

  /**
   * Left side content.
   */
  prefix?: ReactNode;

  /**
   * Right side content.
   */
  suffix?: ReactNode;

  /**
   * Whether to show a clear button for editable non-empty values.
   */
  clearable?: boolean;

  /**
   * Called when the clear button is pressed.
   */
  onClear?: () => void;

  /**
   * Disabled inputs are not editable and expose disabled accessibility state.
   */
  disabled?: boolean;

  /**
   * Readonly inputs are not editable but remain visually readable.
   */
  readonly?: boolean;

  /**
   * Loading state shown in the right side area.
   */
  loading?: boolean;

  /**
   * Root style. Only controls outer layout.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Stable slot style overrides.
   */
  styles?: InputStyles;
}

export interface InputSearchProps extends Omit<InputProps, 'suffix'> {
  /**
   * Called when the user submits the search.
   */
  onSearch?: (value: string) => void;

  /**
   * Custom right side search trigger icon.
   */
  searchIcon?: ReactNode;
}
