import React from 'react';
import { Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import type { IconComponent, IconName } from '../Icon';
import type { ComponentSize } from '../shares/types';
import type { FloatingHitSlop, FloatingMetrics, FloatingSide } from './layout';
import { useTriggerStyles } from './style';
import type { FloatingActionGroupStyles } from './types';

const DRAG_THRESHOLD = 6;
const DRAG_MARGIN = 8;
const FLOAT_MARGIN = 16;
const DRAG_SCALE = 1.05;
const PRESS_SCALE = 0.96;
const PRESS_SUPPRESS_MS = 320;
const FULL_ROTATION = 45;

function clampValue(value: number, min: number, max: number): number {
  'worklet';

  return Math.max(min, Math.min(max, value));
}

interface FloatingActionTriggerProps {
  actionIcon?: IconName | IconComponent;
  accessibilityLabel: string;
  containerWidth: number;
  dragEnabled: boolean;
  hitSlop: FloatingHitSlop;
  isDirect: boolean;
  isDisabled: boolean;
  isDocked: boolean;
  isDragging: boolean;
  isExpanded: boolean;
  metrics: FloatingMetrics;
  onDragCancel: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDragStart: () => void;
  onPress: () => void;
  safeBottom: number;
  safeTop: number;
  side: FloatingSide;
  size: ComponentSize;
  snapToEdge: boolean;
  spacing?: number;
  style?: FloatingActionGroupStyles['trigger'];
  x: SharedValue<number>;
  y: SharedValue<number>;
}

export function FloatingActionTrigger({
  actionIcon,
  accessibilityLabel,
  containerWidth,
  dragEnabled,
  hitSlop,
  isDirect,
  isDisabled,
  isDocked,
  isDragging,
  isExpanded,
  metrics,
  onDragCancel,
  onDragEnd,
  onDragStart,
  onPress,
  safeBottom,
  safeTop,
  side,
  size,
  snapToEdge,
  spacing,
  style,
  x,
  y,
}: FloatingActionTriggerProps) {
  const { token } = useTheme();
  const tokenStyles = useTriggerStyles({ isDragging, size, spacing });
  const [isPressed, setIsPressed] = React.useState(false);
  const suppressPressRef = React.useRef(false);
  const suppressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const dragScale = useSharedValue(1);
  const dockProgress = useSharedValue(isDocked && !isDragging ? 1 : 0);
  const openProgress = useSharedValue(isExpanded ? 1 : 0);
  const animationEasing = React.useMemo(
    () => Easing.bezier(...token.motionEaseOut),
    [token.motionEaseOut],
  );

  React.useEffect(() => {
    dragScale.value = withTiming(
      isDragging ? DRAG_SCALE : isPressed ? PRESS_SCALE : 1,
      {
        duration: token.motionDurationFast,
        easing: animationEasing,
      },
    );
  }, [
    animationEasing,
    dragScale,
    isDragging,
    isPressed,
    token.motionDurationFast,
  ]);

  React.useEffect(() => {
    dockProgress.value = withTiming(isDocked && !isDragging ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: animationEasing,
    });
  }, [
    animationEasing,
    dockProgress,
    isDragging,
    isDocked,
    token.motionDurationMid,
  ]);

  React.useEffect(() => {
    openProgress.value = withTiming(isExpanded ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: animationEasing,
    });
  }, [animationEasing, isExpanded, openProgress, token.motionDurationMid]);

  React.useEffect(
    () => () => {
      if (suppressTimerRef.current !== null) {
        clearTimeout(suppressTimerRef.current);
      }
    },
    [],
  );

  const clearSuppressLater = React.useCallback(() => {
    if (suppressTimerRef.current !== null) {
      clearTimeout(suppressTimerRef.current);
    }
    suppressTimerRef.current = setTimeout(() => {
      suppressPressRef.current = false;
    }, PRESS_SUPPRESS_MS);
  }, []);

  const handlePanStart = React.useCallback(() => {
    suppressPressRef.current = true;
    setIsPressed(false);
    onDragStart();
  }, [onDragStart]);

  const handlePanEnd = React.useCallback(
    (nextX: number, nextY: number) => {
      onDragEnd(nextX, nextY);
      clearSuppressLater();
    },
    [clearSuppressLater, onDragEnd],
  );

  const handlePanCancel = React.useCallback(() => {
    suppressPressRef.current = false;
    onDragCancel();
  }, [onDragCancel]);

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .minDistance(DRAG_THRESHOLD)
        .enabled(dragEnabled)
        .hitSlop(hitSlop)
        .onStart(() => {
          const margin = snapToEdge ? DRAG_MARGIN : FLOAT_MARGIN;
          const startX = clampValue(
            x.value,
            margin,
            containerWidth - margin - metrics.anchorSize,
          );
          const startY = clampValue(
            y.value,
            safeTop,
            safeBottom - metrics.anchorSize,
          );

          dragStartX.value = startX;
          dragStartY.value = startY;
          x.value = startX;
          y.value = startY;
          runOnJS(handlePanStart)();
        })
        .onUpdate(event => {
          const margin = snapToEdge ? DRAG_MARGIN : FLOAT_MARGIN;

          x.value = clampValue(
            dragStartX.value + event.translationX,
            margin,
            containerWidth - margin - metrics.anchorSize,
          );
          y.value = clampValue(
            dragStartY.value + event.translationY,
            safeTop,
            safeBottom - metrics.anchorSize,
          );
        })
        .onEnd((_event, success) => {
          if (success) {
            runOnJS(handlePanEnd)(x.value, y.value);
          }
        })
        .onFinalize((_event, success) => {
          if (!success) {
            runOnJS(handlePanCancel)();
          }
        }),
    [
      containerWidth,
      dragEnabled,
      dragStartX,
      dragStartY,
      handlePanCancel,
      handlePanEnd,
      handlePanStart,
      hitSlop,
      metrics.anchorSize,
      safeBottom,
      safeTop,
      snapToEdge,
      x,
      y,
    ],
  );

  const positionStyle = useAnimatedStyle(
    () => ({
      left: x.value,
      top: y.value,
    }),
    [x, y],
  );

  const scaleStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: dragScale.value }],
    }),
    [dragScale],
  );

  const shapeStyle = useAnimatedStyle(() => {
    const fullRadius = metrics.radius;
    const wallRadius = fullRadius * (1 - dockProgress.value);

    return {
      borderTopLeftRadius: side === 'right' ? fullRadius : wallRadius,
      borderBottomLeftRadius: side === 'right' ? fullRadius : wallRadius,
      borderTopRightRadius: side === 'right' ? wallRadius : fullRadius,
      borderBottomRightRadius: side === 'right' ? wallRadius : fullRadius,
    };
  }, [dockProgress, metrics.radius, side]);

  const iconShiftStyle = useAnimatedStyle(() => {
    const shift = (side === 'right' ? -1 : 1) * metrics.iconShift;

    return {
      transform: [{ translateX: shift * dockProgress.value }],
    };
  }, [dockProgress, metrics.iconShift, side]);

  const iconRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${FULL_ROTATION * openProgress.value}deg` }],
  }));

  const handlePress = (): void => {
    if (suppressPressRef.current) {
      suppressPressRef.current = false;
      return;
    }

    onPress();
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          tokenStyles.trigger,
          positionStyle,
          scaleStyle,
          shapeStyle,
          isDisabled ? tokenStyles.triggerDisabled : null,
          style,
        ]}
      >
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          disabled={isDisabled}
          hitSlop={hitSlop}
          onPress={handlePress}
          onPressIn={() => {
            setIsPressed(true);
          }}
          onPressOut={() => {
            setIsPressed(false);
          }}
          style={({ pressed }) => [
            tokenStyles.triggerPressable,
            pressed && !isDragging ? tokenStyles.triggerPressed : null,
          ]}
          testID="floating-action-group-trigger"
        >
          <Animated.View style={iconShiftStyle}>
            <Animated.View style={iconRotationStyle}>
              <Icon
                color="lightSolid"
                icon={isDirect ? (actionIcon ?? 'plus') : 'plus'}
                size={metrics.iconSize}
              />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
