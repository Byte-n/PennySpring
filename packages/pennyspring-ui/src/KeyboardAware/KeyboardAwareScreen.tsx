import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import type { KeyboardAwareScreenProps } from './types';
import { useScreenStyles } from './style';

function resolveBehavior(
  behavior?: KeyboardAwareScreenProps['behavior'],
): KeyboardAwareScreenProps['behavior'] {
  if (behavior !== undefined) {
    return behavior;
  }

  if (Platform.OS === 'ios') {
    return 'padding';
  }

  return undefined;
}

export function KeyboardAwareScreen({
  behavior,
  children,
  enabled = true,
  style,
  styles,
  ...restProps
}: KeyboardAwareScreenProps): React.JSX.Element {
  const tokenStyles = useScreenStyles();

  return (
    <KeyboardAvoidingView
      behavior={resolveBehavior(behavior)}
      enabled={enabled}
      style={[tokenStyles.root, style, styles?.root]}
      {...restProps}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
