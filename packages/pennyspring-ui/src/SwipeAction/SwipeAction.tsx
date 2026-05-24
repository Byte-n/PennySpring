import type { ComponentSize } from '../shares/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  TextStyle,
  ViewStyle,
} from 'react-native';
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

interface SwipeActionStyleOptions {
  size: ComponentSize;
  disabled: boolean;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  actionMinWidth: (token: AliasToken) => number;
  actionPaddingHorizontal: (token: AliasToken) => number;
  actionFontSize: (token: AliasToken) => number;
  actionLineHeight: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    actionMinWidth: token => token.controlHeight,
    actionPaddingHorizontal: token => token.paddingSM,
    actionFontSize: token => token.fontSizeSM,
    actionLineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    actionMinWidth: token => token.controlHeightLG,
    actionPaddingHorizontal: token => token.paddingMD,
    actionFontSize: token => token.fontSize,
    actionLineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    actionMinWidth: token => token.controlHeightLG + token.controlHeightXS,
    actionPaddingHorizontal: token => token.paddingLG,
    actionFontSize: token => token.fontSizeLG,
    actionLineHeight: token => token.lineHeightLG,
  },
};

const DEFAULT_SWIPE_VALUE: SwipeActionValue = null;
const DRAG_START_DISTANCE = 3;

const useStyles = createUseSheetStyle(
  (token, { disabled, size }: SwipeActionStyleOptions) => {
    const sizeStyle = SIZE_STYLE_MAP[size];

    return {
      root: {
        minHeight: sizeStyle.minHeight(token),
        overflow: 'hidden',
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgContainer,
      },
      track: {
        flexDirection: 'row',
        alignItems: 'stretch',
      },
      content: {
        flex: 1,
        minHeight: sizeStyle.minHeight(token),
        justifyContent: 'center',
        backgroundColor: token.colorBgContainer,
      },
      contentDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
      },
      actionsBase: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        flexDirection: 'row',
      },
      leftActions: {
        left: 0,
      },
      rightActions: {
        right: 0,
      },
      action: {
        minWidth: sizeStyle.actionMinWidth(token),
        paddingHorizontal: sizeStyle.actionPaddingHorizontal(token),
        justifyContent: 'center',
        alignItems: 'center',
      },
      actionDisabled: {
        opacity: token.opacityLoading,
      },
      actionText: {
        fontSize: sizeStyle.actionFontSize(token),
        lineHeight: sizeStyle.actionLineHeight(token),
      },
      actionBgLight: {
        backgroundColor: token.colorFillSecondary,
      },
      actionBgWeak: {
        backgroundColor: token.colorFillTertiary,
      },
      actionBgPrimary: {
        backgroundColor: token.colorPrimary,
      },
      actionBgSuccess: {
        backgroundColor: token.colorSuccess,
      },
      actionBgWarning: {
        backgroundColor: token.colorWarning,
      },
      actionBgDanger: {
        backgroundColor: token.colorError,
      },
      actionTextDark: {
        color: token.colorText,
      },
      actionTextLight: {
        color: token.colorTextLightSolid,
      },
      actionTextDisabled: {
        color: token.colorTextDisabled,
      },
      rootDisabled: {
        backgroundColor: disabled
          ? token.colorBgContainerDisabled
          : token.colorBgContainer,
      },
    };
  },
);

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

function resolveActionBackgroundStyle(
  color: SwipeActionColor,
  tokenStyles: Record<string, ViewStyle | TextStyle>,
): ViewStyle {
  if (color === 'light') {
    return tokenStyles.actionBgLight as ViewStyle;
  }

  if (color === 'weak') {
    return tokenStyles.actionBgWeak as ViewStyle;
  }

  if (color === 'success') {
    return tokenStyles.actionBgSuccess as ViewStyle;
  }

  if (color === 'warning') {
    return tokenStyles.actionBgWarning as ViewStyle;
  }

  if (color === 'danger') {
    return tokenStyles.actionBgDanger as ViewStyle;
  }

  return tokenStyles.actionBgPrimary as ViewStyle;
}

function resolveActionTextStyle(
  color: SwipeActionColor,
  tokenStyles: Record<string, ViewStyle | TextStyle>,
): TextStyle {
  if (color === 'light' || color === 'weak') {
    return tokenStyles.actionTextDark as TextStyle;
  }

  return tokenStyles.actionTextLight as TextStyle;
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
    }) as Record<string, ViewStyle | TextStyle>;
    const [swipeValue, setSwipeValue] = useControllableValue<SwipeActionValue>(
      defaultValue,
      value,
      onChange,
    );
    const [leftWidth, setLeftWidth] = React.useState(0);
    const [rightWidth, setRightWidth] = React.useState(0);
    const [dragOffset, setDragOffset] = React.useState<number | null>(null);

    const startPageXRef = React.useRef(0);
    const startPageYRef = React.useRef(0);
    const startOffsetRef = React.useRef(0);
    const draggingRef = React.useRef(false);

    const isGestureBlocked = disabled || readonly;
    const currentValue = swipeValue ?? null;
    const settledOffset = resolveOffsetByValue(
      currentValue,
      leftWidth,
      rightWidth,
    );
    const trackOffset = dragOffset ?? settledOffset;

    const trackTransformStyle = React.useMemo<ViewStyle>(
      () => ({
        transform: [
          {
            translateX: trackOffset,
          },
        ],
      }),
      [trackOffset],
    );

    const close = React.useCallback((): void => {
      setDragOffset(null);
      setSwipeValue(null);
    }, [setSwipeValue]);

    const show = React.useCallback(
      (side: SwipeActionSide = 'right'): void => {
        if (side === 'left' && leftActions.length === 0) {
          return;
        }

        if (side === 'right' && rightActions.length === 0) {
          return;
        }

        setDragOffset(null);
        setSwipeValue(side);
        onActionsReveal?.(side);
      },
      [leftActions.length, onActionsReveal, rightActions.length, setSwipeValue],
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

    function handleResponderGrant(event: GestureResponderEvent): void {
      if (isGestureBlocked) {
        return;
      }

      startPageXRef.current = event.nativeEvent.pageX;
      startPageYRef.current = event.nativeEvent.pageY;
      startOffsetRef.current = settledOffset;
      draggingRef.current = false;
    }

    function handleResponderMove(event: GestureResponderEvent): void {
      if (isGestureBlocked) {
        return;
      }

      const deltaX = event.nativeEvent.pageX - startPageXRef.current;
      const deltaY = event.nativeEvent.pageY - startPageYRef.current;

      if (
        draggingRef.current === false &&
        (Math.abs(deltaX) <= DRAG_START_DISTANCE ||
          Math.abs(deltaX) <= Math.abs(deltaY))
      ) {
        return;
      }

      draggingRef.current = true;

      const nextOffset = clamp(
        startOffsetRef.current + deltaX,
        -rightWidth,
        leftWidth,
      );
      setDragOffset(nextOffset);
    }

    function settleOffset(nextOffset: number): void {
      const nextValue = resolveNearestValue(nextOffset, leftWidth, rightWidth);

      setDragOffset(null);
      setSwipeValue(nextValue);

      if (nextValue !== null) {
        onActionsReveal?.(nextValue);
      }
    }

    function handleResponderRelease(event: GestureResponderEvent): void {
      if (isGestureBlocked) {
        return;
      }

      const deltaX = event.nativeEvent.pageX - startPageXRef.current;
      const nextOffset = clamp(
        startOffsetRef.current + deltaX,
        -rightWidth,
        leftWidth,
      );

      settleOffset(nextOffset);
      draggingRef.current = false;
    }

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
      const backgroundStyle =
        action.backgroundColor !== undefined
          ? ({ backgroundColor: action.backgroundColor } as ViewStyle)
          : resolveActionBackgroundStyle(color, tokenStyles);
      const textColorStyle = resolveActionTextStyle(color, tokenStyles);

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

      return (
        <Pressable
          disabled={actionDisabled}
          key={action.key}
          onPress={handleActionPress}
          testID={`swipe-action-${side}-action-${index}`}
          style={[
            tokenStyles.action,
            backgroundStyle,
            actionDisabled ? tokenStyles.actionDisabled : null,
            styles?.action,
          ]}
        >
          {action.content ?? action.text ? (
            <Text
              style={[
                tokenStyles.actionText,
                textColorStyle,
                actionDisabled ? tokenStyles.actionTextDisabled : null,
                styles?.actionText,
              ]}
            >
              {action.content ?? action.text}
            </Text>
          ) : null}
        </Pressable>
      );
    }

    const leftActionsNode = leftActions.map((action, index) =>
      renderAction(action, index, 'left'),
    );
    const rightActionsNode = rightActions.map((action, index) =>
      renderAction(action, index, 'right'),
    );

    return (
      <View
        {...rest}
        onMoveShouldSetResponder={() => !isGestureBlocked}
        onResponderGrant={handleResponderGrant}
        onResponderMove={handleResponderMove}
        onResponderRelease={handleResponderRelease}
        onStartShouldSetResponder={() => !isGestureBlocked}
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
        <View
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
        </View>
      </View>
    );
  },
);
