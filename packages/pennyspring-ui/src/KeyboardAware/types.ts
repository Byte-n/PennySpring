import type { ReactNode } from 'react';
import type {
  KeyboardAvoidingViewProps,
  KeyboardEvent,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface KeyboardInsets {
  keyboardHeight: number;
  keyboardScreenY: number;
  safeAreaBottom: number;
  bottomInset: number;
  isKeyboardVisible: boolean;
}

export interface KeyboardAwareScreenStyles {
  root?: StyleProp<ViewStyle>;
}

export interface KeyboardAwareScreenProps
  extends Omit<KeyboardAvoidingViewProps, 'behavior' | 'children' | 'style'> {
  behavior?: KeyboardAvoidingViewProps['behavior'];
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: KeyboardAwareScreenStyles;
}

export interface KeyboardAwareFormScrollStyles {
  root?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
}

export interface KeyboardAwareFormScrollProps
  extends Omit<
    ScrollViewProps,
    'children' | 'contentContainerStyle' | 'style'
  > {
  children?: ReactNode;
  extraBottomInset?: number;
  style?: StyleProp<ViewStyle>;
  styles?: KeyboardAwareFormScrollStyles;
  useKeyboardInset?: boolean;
}

export interface KeyboardStickyFooterStyles {
  root?: StyleProp<ViewStyle>;
}

export interface KeyboardStickyFooterProps {
  children?: ReactNode;
  disabled?: boolean;
  extraBottomInset?: number;
  style?: StyleProp<ViewStyle>;
  styles?: KeyboardStickyFooterStyles;
  testID?: string;
}

export type KeyboardEventHandler = (event: KeyboardEvent) => void;
