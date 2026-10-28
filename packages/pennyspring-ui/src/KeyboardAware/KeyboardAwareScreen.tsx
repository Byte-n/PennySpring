import React from 'react';
import { View } from 'react-native';
import type { KeyboardAwareScreenProps } from './types';
import { useScreenStyles } from './style';
import { useKeyboardInsets } from './useKeyboardInsets';
import { KeyboardAwareContext } from './KeyboardAwareContext';

export function KeyboardAwareScreen({
  children,
  enabled = true,
  style,
  styles,
  ...restProps
}: KeyboardAwareScreenProps): React.JSX.Element {
  const keyboardInsets = useKeyboardInsets();
  const bottomInset = enabled ? keyboardInsets.bottomInset : 0;
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
