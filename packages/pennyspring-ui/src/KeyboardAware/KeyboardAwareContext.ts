import { createContext, useContext } from 'react';

interface KeyboardAwareContextValue {
  isScreenAvoidingKeyboard: boolean;
}

const DEFAULT_KEYBOARD_AWARE_CONTEXT: KeyboardAwareContextValue = {
  isScreenAvoidingKeyboard: false,
};

export const KeyboardAwareContext = createContext<KeyboardAwareContextValue>(
  DEFAULT_KEYBOARD_AWARE_CONTEXT,
);

export function useKeyboardAwareContext(): KeyboardAwareContextValue {
  return useContext(KeyboardAwareContext);
}
