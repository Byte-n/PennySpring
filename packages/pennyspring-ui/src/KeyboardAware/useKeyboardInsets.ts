import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import type { EmitterSubscription, KeyboardEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { KeyboardInsets } from './types';

const INITIAL_KEYBOARD_SCREEN_Y = 0;
const MIN_BOTTOM_INSET = 0;

function resolveKeyboardHeight(event: KeyboardEvent): number {
  const height = event.endCoordinates?.height ?? 0;

  return Math.max(height, 0);
}

function resolveKeyboardScreenY(event: KeyboardEvent): number {
  const screenY = event.endCoordinates?.screenY ?? INITIAL_KEYBOARD_SCREEN_Y;

  return Math.max(screenY, 0);
}

export function useKeyboardInsets(): KeyboardInsets {
  const safeAreaInsets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardScreenY, setKeyboardScreenY] = useState(
    INITIAL_KEYBOARD_SCREEN_Y,
  );
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subscriptions: EmitterSubscription[] = [
      Keyboard.addListener(showEvent, event => {
        setKeyboardHeight(resolveKeyboardHeight(event));
        setKeyboardScreenY(resolveKeyboardScreenY(event));
        setIsKeyboardVisible(true);
      }),
      Keyboard.addListener(hideEvent, event => {
        setKeyboardHeight(0);
        setKeyboardScreenY(resolveKeyboardScreenY(event));
        setIsKeyboardVisible(false);
      }),
    ];

    return () => {
      subscriptions.forEach(subscription => {
        subscription.remove();
      });
    };
  }, []);

  return useMemo(
    () => ({
      keyboardHeight,
      keyboardScreenY,
      safeAreaBottom: safeAreaInsets.bottom,
      // 键盘高度含底部安全区，先减掉再由各部件各自消费一次。
      bottomInset: isKeyboardVisible
        ? Math.max(keyboardHeight - safeAreaInsets.bottom, MIN_BOTTOM_INSET)
        : MIN_BOTTOM_INSET,
      isKeyboardVisible,
    }),
    [isKeyboardVisible, keyboardHeight, keyboardScreenY, safeAreaInsets.bottom],
  );
}
