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

  /** Clear button container style. */
  clearButton?: StyleProp<ViewStyle>;

  /** Password visibility toggle button container style. */
  passwordButton?: StyleProp<ViewStyle>;
}

export interface InputProps extends Omit<
  TextInputProps,
  | 'defaultValue'
  | 'editable'
  | 'onChange'
  | 'onChangeText'
  | 'placeholder'
  | 'readOnly'
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
   * Validation status. Error status switches label and underline to error styling.
   */
  status?: InputStatus;

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
  allowClear?: boolean;

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
   * Loading locks the field, dims its content, and shows a spinner in the
   * right side area.
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

export interface InputPasswordProps extends Omit<
  InputProps,
  'secureTextEntry'
> {
  /**
   * Whether to render the password visibility toggle. Defaults to true.
   */
  visibilityToggle?: boolean;
}
