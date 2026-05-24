import React from 'react';
import { ScrollView } from 'react-native';
import type { KeyboardAwareFormScrollProps } from './types';
import { useFormScrollStyles } from './style';
import { useKeyboardInsets } from './useKeyboardInsets';

export function KeyboardAwareFormScroll({
  children,
  extraBottomInset = 0,
  keyboardDismissMode = 'interactive',
  keyboardShouldPersistTaps = 'handled',
  style,
  styles,
  useKeyboardInset = true,
  ...restProps
}: KeyboardAwareFormScrollProps): React.JSX.Element {
  const keyboardInsets = useKeyboardInsets();
  const bottomInset = useKeyboardInset
    ? keyboardInsets.bottomInset + extraBottomInset
    : extraBottomInset;
  const tokenStyles = useFormScrollStyles({ bottomInset });

  return (
    <ScrollView
      keyboardDismissMode={keyboardDismissMode}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      style={[tokenStyles.root, style, styles?.root]}
      contentContainerStyle={[tokenStyles.content, styles?.content]}
      {...restProps}
    >
      {children}
    </ScrollView>
  );
}
