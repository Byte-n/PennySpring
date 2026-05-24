import React from 'react';
import { View } from 'react-native';
import type { KeyboardStickyFooterProps } from './types';
import { useStickyFooterStyles } from './style';
import { useKeyboardInsets } from './useKeyboardInsets';

export function KeyboardStickyFooter({
  children,
  disabled = false,
  extraBottomInset = 0,
  style,
  styles,
  testID,
}: KeyboardStickyFooterProps): React.JSX.Element {
  const keyboardInsets = useKeyboardInsets();
  const bottomInset = disabled
    ? extraBottomInset
    : keyboardInsets.bottomInset + extraBottomInset;
  const tokenStyles = useStickyFooterStyles({ bottomInset });

  return (
    <View
      style={[tokenStyles.root, style, styles?.root]}
      testID={testID}
    >
      {children}
    </View>
  );
}
