import type { ComponentSize } from '../shares/types';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import type {
  EmitterSubscription,
  KeyboardEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import { useTheme } from '@pennyspring/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useControllableValue } from '../_hooks';
import { Popup as PopupRoot } from './Popup';
import type {
  PopupFloatingPanelHeight,
  PopupFloatingPanelPosition,
  PopupFloatingPanelProps,
} from './types';

interface FloatingPanelStyleOptions {
  panelHeight: number;
  position: PopupFloatingPanelPosition;
  size: ComponentSize;
}

interface FloatingPanelSizeConfig {
  contentPadding: (token: AliasToken) => number;
  handleHeight: (token: AliasToken) => number;
  handleWidth: (token: AliasToken) => number;
  indicatorHeight: (token: AliasToken) => number;
}

const DEFAULT_MIN_HEIGHT_RATIO = 0.35;
const DEFAULT_MAX_HEIGHT_RATIO = 0.8;
const PERCENT_HEIGHT_UNIT = '%';
const PERCENT_HEIGHT_RATIO = 100;

const SIZE_MAP: Record<ComponentSize, FloatingPanelSizeConfig> = {
  small: {
    contentPadding: token => token.paddingSM,
    handleHeight: token => token.controlHeightXS,
    handleWidth: token => token.controlHeightSM,
    indicatorHeight: token => token.lineWidthBold,
  },
  normal: {
    contentPadding: token => token.paddingMD,
    handleHeight: token => token.controlHeightSM,
    handleWidth: token => token.controlHeight,
    indicatorHeight: token => token.sizeXXS,
  },
  large: {
    contentPadding: token => token.paddingLG,
    handleHeight: token => token.controlHeight,
    handleWidth: token => token.controlHeightLG,
    indicatorHeight: token => token.sizeXS,
  },
};

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function resolvePosition(
  position?: PopupFloatingPanelPosition,
): PopupFloatingPanelPosition {
  if (position === 'top') {
    return 'top';
  }

  return 'bottom';
}

function resolveSize(size?: ComponentSize): ComponentSize {
  if (size === 'small' || size === 'large') {
    return size;
  }

  return 'normal';
}

function resolveHeightRange(
  viewportHeight: number,
  height?: PopupFloatingPanelHeight,
  minHeight?: PopupFloatingPanelHeight,
  maxHeight?: PopupFloatingPanelHeight,
): readonly [number, number] {
  const resolvedHeight = resolveHeightValue(height, viewportHeight);
  const resolvedMinHeight = resolveHeightValue(minHeight, viewportHeight);
  const resolvedMaxHeight = resolveHeightValue(maxHeight, viewportHeight);
  const defaultMinHeight = viewportHeight * DEFAULT_MIN_HEIGHT_RATIO;
  const defaultMaxHeight = viewportHeight * DEFAULT_MAX_HEIGHT_RATIO;
  const rawMinHeight =
    resolvedMinHeight
      ?? (resolvedHeight === undefined
        ? defaultMinHeight
        : Math.min(resolvedHeight, defaultMinHeight));
  const rawMaxHeight =
    resolvedMaxHeight
      ?? (resolvedHeight === undefined
        ? defaultMaxHeight
        : Math.max(resolvedHeight, defaultMaxHeight));

  if (rawMinHeight <= rawMaxHeight) {
    return [rawMinHeight, rawMaxHeight];
  }

  return [rawMaxHeight, rawMinHeight];
}

function resolveHeightValue(
  value: PopupFloatingPanelHeight | undefined,
  viewportHeight: number,
): number | undefined {
  if (typeof value === 'number') {
    return value;
  }

  if (value?.endsWith(PERCENT_HEIGHT_UNIT) !== true) {
    return undefined;
  }

  const percentage = Number(value.slice(0, -PERCENT_HEIGHT_UNIT.length));

  if (!Number.isFinite(percentage)) {
    return undefined;
  }

  return viewportHeight * percentage / PERCENT_HEIGHT_RATIO;
}

const useStyles = createUseSheetStyle(
  (token, { panelHeight, position, size }: FloatingPanelStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];
    const handleBorderRadius = sizeConfig.indicatorHeight(token);

    return {
      popupBody: {
        height: panelHeight,
        padding: 0,
      },
      root: {
        width: '100%',
        height: '100%',
      },
      content: {
        flex: 1,
        padding: sizeConfig.contentPadding(token),
      },
      handle: {
        minHeight: sizeConfig.handleHeight(token),
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius:
          position === 'top' ? 0 : token.borderRadiusLG,
        borderTopRightRadius:
          position === 'top' ? 0 : token.borderRadiusLG,
        borderBottomLeftRadius:
          position === 'top' ? token.borderRadiusLG : 0,
        borderBottomRightRadius:
          position === 'top' ? token.borderRadiusLG : 0,
      },
      handleIndicator: {
        width: sizeConfig.handleWidth(token),
        height: sizeConfig.indicatorHeight(token),
        borderRadius: handleBorderRadius,
        backgroundColor: token.colorFillSecondary,
      },
    };
  },
);

function createDragGesture(
  onBegin: () => void,
  onUpdate: (translationY: number) => void,
):
  | ReturnType<typeof Gesture.Pan>
  | undefined {
  const panGestureFactory = Gesture?.Pan;

  if (typeof panGestureFactory !== 'function') {
    return undefined;
  }

  return panGestureFactory()
    .runOnJS(true)
    .onBegin(onBegin)
    .onUpdate(event => {
      onUpdate(event.translationY);
    });
}

function getResponderTranslationY(
  gestureState?: {
    dy?: number;
    translationY?: number;
  },
): number {
  if (gestureState?.translationY !== undefined) {
    return gestureState.translationY;
  }

  return gestureState?.dy ?? 0;
}

function resolveKeyboardHeight(event: KeyboardEvent): number {
  const height = event.endCoordinates?.height ?? 0;

  return Math.max(height, 0);
}

function useKeyboardOffset(
  enabled: boolean,
  position: PopupFloatingPanelPosition,
): number {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!enabled || position !== 'bottom') {
      setKeyboardOffset(0);
      return;
    }

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subscriptions: EmitterSubscription[] = [
      Keyboard.addListener(showEvent, event => {
        setKeyboardOffset(resolveKeyboardHeight(event));
      }),
      Keyboard.addListener(hideEvent, () => {
        setKeyboardOffset(0);
      }),
    ];

    return () => {
      subscriptions.forEach(subscription => {
        subscription.remove();
      });
    };
  }, [enabled, position]);

  return keyboardOffset;
}

export function FloatingPanel({
  afterOpenChange,
  animation,
  animationDuration,
  children,
  closeOnMaskClick = true,
  defaultOpen,
  defaultValue,
  height,
  keyboardAvoiding = false,
  mask = true,
  maxHeight,
  minHeight,
  mountPoint = 'auto',
  onCancel,
  onChange,
  onOpenChange,
  open,
  position,
  size,
  style,
  styles,
  value,
}: PopupFloatingPanelProps) {
  const { token } = useTheme();
  const { height: viewportHeight } = useWindowDimensions();
  const resolvedPosition = resolvePosition(position);
  const resolvedSize = resolveSize(size);
  const keyboardOffset = useKeyboardOffset(keyboardAvoiding, resolvedPosition);
  const keyboardOffsetProgress = useSharedValue(keyboardOffset);
  const resolvedHeight = resolveHeightValue(height, viewportHeight);
  const [resolvedMinHeight, resolvedMaxHeight] = resolveHeightRange(
    viewportHeight,
    height,
    minHeight,
    maxHeight,
  );

  const defaultPanelHeight = clamp(
    defaultValue ?? resolvedHeight ?? resolvedMinHeight,
    resolvedMinHeight,
    resolvedMaxHeight,
  );
  const controlledPanelHeight =
    value === undefined
      ? undefined
      : clamp(value, resolvedMinHeight, resolvedMaxHeight);
  const [panelHeight, setPanelHeight] = useControllableValue(
    defaultPanelHeight,
    controlledPanelHeight,
    onChange,
  );
  const normalizedPanelHeight = clamp(
    panelHeight ?? defaultPanelHeight,
    resolvedMinHeight,
    resolvedMaxHeight,
  );

  const tokenStyles = useStyles({
    panelHeight: normalizedPanelHeight,
    position: resolvedPosition,
    size: resolvedSize,
  });
  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    bottom: keyboardOffsetProgress.value,
  }));
  const popupLayoutStyle =
    keyboardAnimatedStyle as unknown as StyleProp<ViewStyle>;

  useEffect(() => {
    const easing = Easing?.bezier?.(...token.motionEaseOut);

    keyboardOffsetProgress.value = withTiming(keyboardOffset, {
      duration: token.motionDurationMid,
      ...(easing ? { easing } : null),
    });
  }, [
    keyboardOffset,
    keyboardOffsetProgress,
    token.motionDurationMid,
    token.motionEaseOut,
  ]);

  const dragStartHeightRef = useRef(normalizedPanelHeight);

  const direction = resolvedPosition === 'bottom' ? 1 : -1;

  function handleGestureBegin(): void {
    dragStartHeightRef.current = normalizedPanelHeight;
  }

  function handleGestureUpdate(translationY: number): void {
    const nextHeight = clamp(
      dragStartHeightRef.current - translationY * direction,
      resolvedMinHeight,
      resolvedMaxHeight,
    );

    setPanelHeight(nextHeight);
  }

  function handleResponderGrant(): void {
    handleGestureBegin();
  }

  function handleResponderMove(
    _event: unknown,
    gestureState?: {
      dy?: number;
      translationY?: number;
    },
  ): void {
    handleGestureUpdate(getResponderTranslationY(gestureState));
  }

  function handleResponderRelease(
    _event: unknown,
    gestureState?: {
      dy?: number;
      translationY?: number;
    },
  ): void {
    handleGestureUpdate(getResponderTranslationY(gestureState));
  }

  const dragGesture = createDragGesture(
    handleGestureBegin,
    handleGestureUpdate,
  );

  const handleContent = (
    <Pressable
      onResponderGrant={handleResponderGrant}
      onResponderMove={handleResponderMove}
      onResponderRelease={handleResponderRelease}
      style={[tokenStyles.handle, styles?.handle]}
      testID="floating-panel-handle"
    >
      <View
        pointerEvents="none"
        style={[tokenStyles.handleIndicator, styles?.handleIndicator]}
        testID="floating-panel-handle-indicator"
      />
    </Pressable>
  );

  const handleNode = dragGesture ? (
    <GestureDetector gesture={dragGesture}>
      {handleContent}
    </GestureDetector>
  ) : (
    handleContent
  );

  const handleAtTop = resolvedPosition === 'bottom';

  return (
    <PopupRoot
      afterOpenChange={afterOpenChange}
      animation={animation}
      animationDuration={animationDuration}
      closeOnMaskClick={closeOnMaskClick}
      defaultOpen={defaultOpen}
      mask={mask}
      mountPoint={mountPoint}
      onCancel={onCancel}
      onOpenChange={onOpenChange}
      open={open}
      position={resolvedPosition}
      style={popupLayoutStyle}
      styles={{
        body: [tokenStyles.popupBody, styles?.body],
        mask: styles?.mask,
      }}
    >
      <View style={[tokenStyles.root, style]} testID="floating-panel-root">
        {handleAtTop ? handleNode : null}
        <View style={[tokenStyles.content, styles?.content]}>{children}</View>
        {handleAtTop ? null : handleNode}
      </View>
    </PopupRoot>
  );
}
