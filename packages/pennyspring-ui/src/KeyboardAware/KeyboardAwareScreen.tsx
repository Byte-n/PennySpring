import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import type { KeyboardAwareScreenProps } from './types';
import { useScreenStyles } from './style';
import { useKeyboardInsets } from './useKeyboardInsets';
import { KeyboardAwareContext } from './KeyboardAwareContext';

const NO_BOTTOM_INSET = 0;

function resolveKeyboardAvoidingInset(
  windowHeight: number,
  keyboardScreenY: number,
): number {
  if (keyboardScreenY <= NO_BOTTOM_INSET) {
    return NO_BOTTOM_INSET;
  }

  return Math.max(windowHeight - keyboardScreenY, NO_BOTTOM_INSET);
}

export function KeyboardAwareScreen({
  children,
  enabled = true,
  style,
  styles,
  ...restProps
}: KeyboardAwareScreenProps): React.JSX.Element {
  const { height: windowHeight } = useWindowDimensions();
  const keyboardInsets = useKeyboardInsets();
  const bottomInset =
    enabled && keyboardInsets.isKeyboardVisible
      ? resolveKeyboardAvoidingInset(windowHeight, keyboardInsets.keyboardScreenY)
      : NO_BOTTOM_INSET;
  const tokenStyles = useScreenStyles({ bottomInset });

  return (
    <KeyboardAwareContext.Provider
      value={{ isScreenAvoidingKeyboard: enabled }}
    >
      <View
        style={[tokenStyles.root, style, styles?.root]}
        {...restProps}
      >
        {children}
      </View>
    </KeyboardAwareContext.Provider>
  );
}
