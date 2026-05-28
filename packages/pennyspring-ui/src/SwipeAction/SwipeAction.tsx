import type { ComponentSize } from '../shares/types';
import type { TextSize } from '../Text/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import type {
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useControllableValue } from '../_hooks';
import { Text } from '../Text';
import type {
  SwipeActionAction,
  SwipeActionColor,
  SwipeActionProps,
  SwipeActionRef,
  SwipeActionSide,
  SwipeActionValue,
} from './types';
import {
  resolveActionBackgroundStyle,
  resolveActionTextColor,
  useStyles,
} from './style';

const DEFAULT_SWIPE_VALUE: SwipeActionValue = null;
const DRAG_START_DISTANCE = 3;

const SIZE_TEXT_MAP: Record<ComponentSize, TextSize> = {
  small: 'sm',
  normal: 'md',
  large: 'lg',
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

function resolveOffsetByValue(
  value: SwipeActionValue,
  leftWidth: number,
  rightWidth: number,
): number {
  if (value === 'left') {
    return leftWidth;
  }

  if (value === 'right') {
    return -rightWidth;
  }

  return 0;
}

function shouldHandleHorizontalGesture(
  translationX: number,
  translationY: number,
): boolean {
  return (
    Math.abs(translationX) > DRAG_START_DISTANCE &&
    Math.abs(translationX) > Math.abs(translationY)
  );
}

function resolveNearestValue(
  offset: number,
  leftWidth: number,
  rightWidth: number,
): SwipeActionValue {
  const candidates: Array<{ value: SwipeActionValue; offset: number }> = [
    {
      value: null,
      offset: 0,
    },
  ];

  if (leftWidth > 0) {
    candidates.push({
      value: 'left',
      offset: leftWidth,
    });
  }

  if (rightWidth > 0) {
    candidates.push({
      value: 'right',
      offset: -rightWidth,
    });
  }

  return candidates.reduce((nearest, current) => {
    if (Math.abs(current.offset - offset) < Math.abs(nearest.offset - offset)) {
      return current;
    }

    return nearest;
  }, candidates[0]).value;
}

function resolveActionColor(
  action: SwipeActionAction,
  side: SwipeActionSide,
): SwipeActionColor {
  if (action.color !== undefined) {
    return action.color;
  }

  return side === 'right' ? 'danger' : 'primary';
}

export const SwipeAction = React.forwardRef<SwipeActionRef, SwipeActionProps>(
  function SwipeAction(
    {
      children,
      closeOnAction = true,
      defaultValue = DEFAULT_SWIPE_VALUE,
      disabled = false,
      leftActions = [],
      onAction,
      onActionsReveal,
      onCancel,
      onChange,
      readonly = false,
      rightActions = [],
      size = 'normal',
      style,
      styles,
      value,
      ...rest
    },
    ref,
  ) {
    const tokenStyles = useStyles({
      disabled: disabled || readonly,
      size,
    }) as Record<string, ViewStyle>;
    const { token } = useTheme();
    const textSize = SIZE_TEXT_MAP[size];
    const [swipeValue, setSwipeValue] = useControllableValue<SwipeActionValue>(
      defaultValue,
      value,
      onChange,
    );
    const [leftWidth, setLeftWidth] = React.useState(0);
    const [rightWidth, setRightWidth] = React.useState(0);

    const startOffsetRef = React.useRef(0);
    const draggingRef = React.useRef(false);
    const translateX = useSharedValue(0);

    const isGestureBlocked = disabled || readonly;
    const currentValue = swipeValue ?? null;
    const settledOffset = resolveOffsetByValue(
      currentValue,
      leftWidth,
      rightWidth,
    );
    const animationEasing = React.useMemo(
      () => Easing.bezier(...token.motionEaseOut),
      [token.motionEaseOut],
    );

    const animateToOffset = React.useCallback(
      (nextOffset: number): void => {
        translateX.value = withTiming(nextOffset, {
          duration: token.motionDurationMid,
          easing: animationEasing,
        });
      },
      [animationEasing, token.motionDurationMid, translateX],
    );

    const trackTransformStyle = useAnimatedStyle<ViewStyle>(() => ({
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    }));

    React.useEffect(() => {
      animateToOffset(settledOffset);
    }, [animateToOffset, settledOffset]);

    const close = React.useCallback((): void => {
      animateToOffset(0);
      setSwipeValue(null);
    }, [animateToOffset, setSwipeValue]);

    const show = React.useCallback(
      (side: SwipeActionSide = 'right'): void => {
        if (side === 'left' && leftActions.length === 0) {
          return;
        }

        if (side === 'right' && rightActions.length === 0) {
          return;
        }

        animateToOffset(resolveOffsetByValue(side, leftWidth, rightWidth));
        setSwipeValue(side);
        onActionsReveal?.(side);
      },
      [
        animateToOffset,
        leftActions.length,
        leftWidth,
        onActionsReveal,
        rightActions.length,
        rightWidth,
        setSwipeValue,
      ],
    );

    React.useImperativeHandle(
      ref,
      () => ({
        close,
        show,
      }),
      [close, show],
    );

    function handleLeftActionsLayout(event: LayoutChangeEvent): void {
      setLeftWidth(event.nativeEvent.layout.width);
    }

    function handleRightActionsLayout(event: LayoutChangeEvent): void {
      setRightWidth(event.nativeEvent.layout.width);
    }

    const settleOffset = React.useCallback(
      (nextOffset: number): void => {
        const nextValue = resolveNearestValue(nextOffset, leftWidth, rightWidth);

        animateToOffset(resolveOffsetByValue(nextValue, leftWidth, rightWidth));
        setSwipeValue(nextValue);

        if (nextValue !== null) {
          onActionsReveal?.(nextValue);
        }
      },
      [
        animateToOffset,
        leftWidth,
        onActionsReveal,
        rightWidth,
        setSwipeValue,
      ],
    );

    const handleGestureBegin = React.useCallback((): void => {
      if (isGestureBlocked) {
        return;
      }

      cancelAnimation(translateX);
      startOffsetRef.current = translateX.value;
      draggingRef.current = false;
    }, [isGestureBlocked, translateX]);

    const handleGestureUpdate = React.useCallback(
      (event: GestureUpdateEvent<PanGestureHandlerEventPayload>): void => {
        if (
          isGestureBlocked ||
          !shouldHandleHorizontalGesture(event.translationX, event.translationY)
        ) {
          return;
        }

        draggingRef.current = true;
        const nextOffset = clamp(
          startOffsetRef.current + event.translationX,
          -rightWidth,
          leftWidth,
        );

        translateX.value = nextOffset;
      },
      [isGestureBlocked, leftWidth, rightWidth, translateX],
    );

    const handleGestureEnd = React.useCallback(
      (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>): void => {
        if (isGestureBlocked) {
          return;
        }

        const translationY = event.translationY ?? 0;

        if (!shouldHandleHorizontalGesture(event.translationX, translationY)) {
          animateToOffset(settledOffset);
          draggingRef.current = false;
          return;
        }

        const nextOffset = clamp(
          startOffsetRef.current + event.translationX,
          -rightWidth,
          leftWidth,
        );

        settleOffset(nextOffset);
        draggingRef.current = false;
      },
      [
        animateToOffset,
        isGestureBlocked,
        leftWidth,
        rightWidth,
        settleOffset,
        settledOffset,
      ],
    );

    const handleGestureFinalize = React.useCallback((
      _event: unknown,
      success: boolean,
    ): void => {
      if (!success) {
        animateToOffset(settledOffset);
        draggingRef.current = false;
      }
    }, [animateToOffset, settledOffset]);

    function handleContentResponderRelease(): void {
      if (draggingRef.current || currentValue === null) {
        return;
      }

      onCancel?.();
      close();
    }

    function renderAction(
      action: SwipeActionAction,
      index: number,
      side: SwipeActionSide,
    ): React.ReactNode {
      const actionDisabled = isGestureBlocked || action.disabled === true;
      const color = resolveActionColor(action, side);
      const backgroundStyle = resolveActionBackgroundStyle(
        color,
        tokenStyles,
        token,
      );
      const textColor = resolveActionTextColor(color, actionDisabled);

      function handleActionPress(): void {
        if (actionDisabled) {
          return;
        }

        action.onPress?.();
        onAction?.(action, index, side);

        if (closeOnAction) {
          close();
        }
      }

      function renderContent(): React.ReactNode {
        if (action.action === null) {
          return null;
        }

        if (action.action !== undefined) {
          return action.action;
        }

        if (action.actionText !== undefined) {
          return (
            <Text
              color={textColor as 'default' | 'lightSolid' | 'disabled'}
              size={textSize}
              style={styles?.actionText}
            >
              {action.actionText}
            </Text>
          );
        }

        return null;
      }

      return (
        <Pressable
          disabled={actionDisabled}
          key={action.key}
          onPress={handleActionPress}
          testID={`swipe-action-${side}-action-${index}`}
          style={({ pressed }) => [
            tokenStyles.action,
            backgroundStyle,
            actionDisabled ? tokenStyles.actionDisabled : null,
            pressed ? tokenStyles.actionPressed : null,
            styles?.action,
          ]}
        >
          {renderContent()}
        </Pressable>
      );
    }

    const leftActionsNode = leftActions.map((action, index) =>
      renderAction(action, index, 'left'),
    );
    const rightActionsNode = rightActions.map((action, index) =>
      renderAction(action, index, 'right'),
    );

    const panGesture = React.useMemo(
      () =>
        Gesture.Pan()
          .enabled(!isGestureBlocked)
          .runOnJS(true)
          .minDistance(DRAG_START_DISTANCE)
          .activeOffsetX([-DRAG_START_DISTANCE, DRAG_START_DISTANCE])
          .onBegin(handleGestureBegin)
          .onUpdate(handleGestureUpdate)
          .onEnd(handleGestureEnd)
          .onFinalize(handleGestureFinalize),
      [
        handleGestureBegin,
        handleGestureEnd,
        handleGestureFinalize,
        handleGestureUpdate,
        isGestureBlocked,
      ],
    );

    return (
      <GestureDetector gesture={panGesture}>
        <View
          {...rest}
          style={[tokenStyles.root, tokenStyles.rootDisabled, style]}
          testID="swipe-action-root"
        >
          <View
            onLayout={handleLeftActionsLayout}
            style={[
              tokenStyles.actionsBase,
              tokenStyles.leftActions,
              styles?.leftActions,
            ]}
            testID="swipe-action-left-actions"
          >
            {leftActionsNode}
          </View>
          <View
            onLayout={handleRightActionsLayout}
            style={[
              tokenStyles.actionsBase,
              tokenStyles.rightActions,
              styles?.rightActions,
            ]}
            testID="swipe-action-right-actions"
          >
            {rightActionsNode}
          </View>
          <Animated.View
            style={[tokenStyles.track, trackTransformStyle, styles?.track]}
            testID="swipe-action-track"
          >
            <View
              onResponderRelease={handleContentResponderRelease}
              style={[
                tokenStyles.content,
                isGestureBlocked ? tokenStyles.contentDisabled : null,
                styles?.content,
              ]}
              testID="swipe-action-content"
            >
              {children}
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
    );
  },
);
