import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { ScrollView, TextInput } from 'react-native';
import type { KeyboardAwareFormScrollProps } from './types';
import { useFormScrollStyles } from './style';
import { useKeyboardInsets } from './useKeyboardInsets';
import { useTheme } from '@pennyspring/theme';
import { useKeyboardAwareContext } from './KeyboardAwareContext';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const MIN_SCROLL_Y = 0;
const SCROLL_EVENT_THROTTLE_MS = 16;

type ScrollFocusEvent = Parameters<
  NonNullable<KeyboardAwareFormScrollProps['onFocus']>
>[0];

export function KeyboardAwareFormScroll({
  children,
  extraBottomInset = 0,
  focusedInputBottomOffset,
  keyboardDismissMode = 'interactive',
  keyboardShouldPersistTaps = 'handled',
  onFocus,
  onLayout,
  onScroll,
  scrollEventThrottle,
  style,
  styles,
  useKeyboardInset = true,
  ...restProps
}: KeyboardAwareFormScrollProps): React.JSX.Element {
  const { token } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetYRef = useRef(MIN_SCROLL_Y);
  const { isScreenAvoidingKeyboard } = useKeyboardAwareContext();
  const keyboardInsets = useKeyboardInsets();
  const baseBottomInset = isScreenAvoidingKeyboard
    ? keyboardInsets.safeAreaBottom
    : keyboardInsets.bottomInset;
  const bottomInset = useKeyboardInset
    ? baseBottomInset + extraBottomInset
    : extraBottomInset;
  const tokenStyles = useFormScrollStyles({ bottomInset });
  const resolvedScrollEventThrottle =
    scrollEventThrottle ?? SCROLL_EVENT_THROTTLE_MS;
  const resolvedFocusedInputBottomOffset =
    focusedInputBottomOffset ?? token.paddingMD;

  const layoutCallback = useRef<VoidFunction>(null);

  const scrollFocusedInputIntoView = useCallback(() => {
    const scrollView = scrollRef.current;
    const focusedInput = TextInput.State.currentlyFocusedInput();

    if (
      scrollView === null ||
      focusedInput === null ||
      focusedInput === undefined ||
      !keyboardInsets.isKeyboardVisible
    ) {
      return;
    }

    const nativeScrollRef = scrollView.getNativeScrollRef();

    if (nativeScrollRef === null) {
      return;
    }

    nativeScrollRef.measureInWindow((_x, viewportY, _width, viewportHeight) => {
      const keyboardTop =
        keyboardInsets.keyboardScreenY > MIN_SCROLL_Y
          ? keyboardInsets.keyboardScreenY
          : viewportY + viewportHeight;
      const visibleHeight = Math.max(
        Math.min(viewportHeight, keyboardTop - viewportY),
        MIN_SCROLL_Y,
      );

      if (visibleHeight <= MIN_SCROLL_Y) {
        return;
      }

      focusedInput.measureLayout(
        nativeScrollRef,
        (_inputX, inputY, _inputWidth, inputHeight) => {
          const scrollOffsetY = scrollOffsetYRef.current;
          const inputBottomY =
            inputY + inputHeight + resolvedFocusedInputBottomOffset;

          if (inputBottomY <= visibleHeight) {
            return;
          }

          layoutCallback.current = () => {
            layoutCallback.current = null;
            scrollView.scrollTo({
              y: scrollOffsetY + inputBottomY - visibleHeight,
              animated: false,
            });
          };
        },
      );
    });
  }, [
    keyboardInsets.isKeyboardVisible,
    keyboardInsets.keyboardScreenY,
    resolvedFocusedInputBottomOffset,
  ]);
  useLayoutEffect(() => {
    if (!keyboardInsets.isKeyboardVisible) {
      return;
    }

    scrollFocusedInputIntoView();
  }, [keyboardInsets.isKeyboardVisible, scrollFocusedInputIntoView]);

  function handleFocus(event: ScrollFocusEvent): void {
    onFocus?.(event);
    scrollFocusedInputIntoView();
  }

  function handleLayout(event: LayoutChangeEvent): void {
    onLayout?.(event);
    layoutCallback.current?.();
  }

  function handleScroll(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void {
    scrollOffsetYRef.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  }

  return (
    <ScrollView
      ref={scrollRef}
      keyboardDismissMode={keyboardDismissMode}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      onFocus={handleFocus}
      onLayout={handleLayout}
      onScroll={handleScroll}
      scrollEventThrottle={resolvedScrollEventThrottle}
      style={[tokenStyles.root, style, styles?.root]}
      contentContainerStyle={[tokenStyles.content, styles?.content]}
      {...restProps}
    >
      {children}
    </ScrollView>
  );
}
