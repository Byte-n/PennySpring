import React from 'react';
import {
  Pressable,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useTheme } from '@pennyspring/theme';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import type { ComponentSize } from '../shares/types';
import { FloatingActionItem } from './ActionItem';
import { FloatingActionTrigger } from './Trigger';
import {
  resolveActionLayout,
  resolveClampCenterY,
  resolveDockX,
  resolveFloatX,
  resolveGrowUp,
  resolveHitSlop,
  resolveInitialTop,
  resolveMenuOriginX,
  resolveMetrics,
  resolveSide,
  type FloatingSide,
} from './layout';
import { useOverlayStyles, useRailStyles, useRootStyles } from './style';
import type {
  FloatingActionGroupProps,
  FloatingActionGroupStyles,
  FloatingLayout,
  FloatingPlacement,
} from './types';

const SAFE_INSET = 8;
const DEFAULT_OFFSET = 16;
const SCRIM_OPACITY = 0.32;
const RAIL_WIDTH = 2;
const RAIL_HEIGHT = 44;
const RAIL_OPACITY = 0.24;
const ZERO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_PLACEMENT: FloatingPlacement = 'bottomRight';
const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_LAYOUT: FloatingLayout = 'grid';

interface ContainerSize {
  width: number;
  height: number;
}

interface AnchorPosition {
  x: number;
  y: number;
}

function clampX(value: number, width: number, size: number): number {
  return Math.max(0, Math.min(width - size, value));
}

export function FloatingActionGroup({
  actions,
  collapseOnOutsidePress = true,
  draggable = false,
  layout = DEFAULT_LAYOUT,
  mountPoint = 'auto',
  offset,
  placement = DEFAULT_PLACEMENT,
  size = DEFAULT_SIZE,
  snapToEdge = false,
  spacing,
  style,
  styles,
}: FloatingActionGroupProps) {
  const { token } = useTheme();
  const insets = React.useContext(SafeAreaInsetsContext) ?? ZERO_INSETS;
  const window = useWindowDimensions();
  const portalContext = React.useContext(PortalContext);
  const isPortal =
    mountPoint === 'portal' ||
    (mountPoint === 'auto' && portalContext !== null);
  const [container, setContainer] = React.useState<ContainerSize>({
    width: window.width,
    height: window.height,
  });
  const safeTop = (isPortal ? insets.top : ZERO_INSETS.top) + SAFE_INSET;
  const safeBottom =
    container.height -
    (isPortal ? insets.bottom : ZERO_INSETS.bottom) -
    SAFE_INSET;
  const offsetX = offset?.x ?? DEFAULT_OFFSET;
  const offsetY = offset?.y ?? DEFAULT_OFFSET;
  const metrics = React.useMemo(
    () => resolveMetrics(size, spacing),
    [size, spacing],
  );
  const actionCount = actions.length;
  const hasLabel = React.useMemo(
    () => actions.some(action => action.label !== undefined),
    [actions],
  );
  const rootStyles = useRootStyles();
  const overlayStyles = useOverlayStyles();
  const railStyles = useRailStyles();
  const initialSide = resolveSide(placement);
  const initialPosition = React.useMemo<AnchorPosition>(() => {
    const x = snapToEdge
      ? resolveDockX(initialSide, container.width, metrics)
      : resolveFloatX(initialSide, container.width, offsetX, metrics);
    const top = resolveInitialTop(
      placement,
      container.height,
      offsetY,
      safeTop,
      safeBottom,
      metrics,
    );
    const growUp = resolveGrowUp(
      top + metrics.anchorSize / 2,
      container.height,
    );
    const resolved = resolveActionLayout({
      count: actionCount,
      layout,
      side: initialSide,
      metrics,
      hasLabel,
      growUp,
    });
    const centerY = resolveClampCenterY(
      top + metrics.anchorSize / 2,
      resolved,
      safeTop,
      safeBottom,
    );

    return { x, y: centerY - metrics.anchorSize / 2 };
  }, [
    actionCount,
    container.height,
    container.width,
    hasLabel,
    initialSide,
    layout,
    metrics,
    offsetX,
    offsetY,
    placement,
    safeBottom,
    safeTop,
    size,
    snapToEdge,
  ]);
  const [position, setPosition] =
    React.useState<AnchorPosition>(initialPosition);
  const [side, setSide] = React.useState<FloatingSide>(initialSide);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const positionRef = React.useRef(position);
  const sideRef = React.useRef(side);
  const lastSnapRef = React.useRef(snapToEdge);
  const lastPlacementKeyRef = React.useRef(
    `${placement}|${offsetX}|${offsetY}`,
  );
  const isMenuOpen = isExpanded && actionCount >= 2;
  const growUp = resolveGrowUp(
    position.y + metrics.anchorSize / 2,
    container.height,
  );
  const resolvedLayout = React.useMemo(
    () =>
      resolveActionLayout({
        count: actionCount,
        layout,
        side,
        metrics,
        hasLabel,
        growUp,
      }),
    [actionCount, growUp, hasLabel, layout, metrics, side],
  );
  const menuOriginX = resolveMenuOriginX({
    side,
    containerWidth: container.width,
    anchorX: position.x,
    snapToEdge,
    metrics,
    layout: resolvedLayout,
  });
  const menuOriginY = position.y + metrics.anchorSize / 2;
  const anchorX = useSharedValue(position.x);
  const anchorY = useSharedValue(position.y);
  const scrimProgress = useSharedValue(0);
  const animationEasing = React.useMemo(
    () => Easing.bezier(...token.motionEaseOut),
    [token.motionEaseOut],
  );
  const snapAnimation = React.useMemo(
    () => ({
      duration: token.motionDurationSlow,
      easing: Easing.bezier(...token.motionEaseOutCirc),
    }),
    [token.motionDurationSlow, token.motionEaseOutCirc],
  );

  const commitPosition = React.useCallback(
    (x: number, y: number, nextSide: FloatingSide) => {
      positionRef.current = { x, y };
      sideRef.current = nextSide;
      setPosition({ x, y });
      setSide(nextSide);
    },
    [],
  );

  const resolvePlacementPosition = React.useCallback((): AnchorPosition => {
    const nextSide = resolveSide(placement);
    const x = snapToEdge
      ? resolveDockX(nextSide, container.width, metrics)
      : resolveFloatX(nextSide, container.width, offsetX, metrics);
    const top = resolveInitialTop(
      placement,
      container.height,
      offsetY,
      safeTop,
      safeBottom,
      metrics,
    );
    const nextGrowUp = resolveGrowUp(
      top + metrics.anchorSize / 2,
      container.height,
    );
    const nextLayout = resolveActionLayout({
      count: actionCount,
      layout,
      side: nextSide,
      metrics,
      hasLabel,
      growUp: nextGrowUp,
    });
    const centerY = resolveClampCenterY(
      top + metrics.anchorSize / 2,
      nextLayout,
      safeTop,
      safeBottom,
    );

    return { x, y: centerY - metrics.anchorSize / 2 };
  }, [
    actionCount,
    container.height,
    container.width,
    hasLabel,
    layout,
    metrics,
    offsetX,
    offsetY,
    placement,
    safeBottom,
    safeTop,
    size,
    snapToEdge,
  ]);

  React.useEffect(() => {
    anchorX.value = withTiming(position.x, snapAnimation);
    anchorY.value = withTiming(position.y, snapAnimation);
  }, [anchorX, anchorY, position.x, position.y, snapAnimation]);

  React.useEffect(() => {
    scrimProgress.value = withTiming(
      isMenuOpen && collapseOnOutsidePress ? 1 : 0,
      {
        duration: token.motionDurationMid,
        easing: animationEasing,
      },
    );
  }, [
    animationEasing,
    collapseOnOutsidePress,
    isMenuOpen,
    scrimProgress,
    token.motionDurationMid,
  ]);

  React.useEffect(() => {
    const placementKey = `${placement}|${offsetX}|${offsetY}`;

    if (lastPlacementKeyRef.current === placementKey) {
      return;
    }

    lastPlacementKeyRef.current = placementKey;
    const nextPosition = resolvePlacementPosition();
    const nextSide = resolveSide(placement);
    commitPosition(nextPosition.x, nextPosition.y, nextSide);
  }, [commitPosition, offsetX, offsetY, placement, resolvePlacementPosition]);

  React.useEffect(() => {
    if (container.width <= 0 || container.height <= 0) {
      return;
    }

    const current = positionRef.current;
    const snapChanged = lastSnapRef.current !== snapToEdge;
    lastSnapRef.current = snapToEdge;
    const nextSide: FloatingSide =
      current.x + metrics.anchorSize / 2 < container.width / 2
        ? 'left'
        : 'right';
    const currentGrowUp = resolveGrowUp(
      current.y + metrics.anchorSize / 2,
      container.height,
    );
    const nextLayout = resolveActionLayout({
      count: actionCount,
      layout,
      side: nextSide,
      metrics,
      hasLabel,
      growUp: currentGrowUp,
    });
    const nextX = snapToEdge
      ? resolveDockX(nextSide, container.width, metrics)
      : snapChanged
        ? resolveFloatX(nextSide, container.width, offsetX, metrics)
        : clampX(current.x, container.width, metrics.anchorSize);
    const centerY = resolveClampCenterY(
      current.y + metrics.anchorSize / 2,
      nextLayout,
      safeTop,
      safeBottom,
    );
    const nextY = centerY - metrics.anchorSize / 2;

    if (
      nextX !== positionRef.current.x ||
      nextY !== positionRef.current.y ||
      nextSide !== sideRef.current
    ) {
      commitPosition(nextX, nextY, nextSide);
    }
  }, [
    actionCount,
    commitPosition,
    container.height,
    container.width,
    hasLabel,
    layout,
    metrics,
    offsetX,
    safeBottom,
    safeTop,
    size,
    snapToEdge,
  ]);

  const handleLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;

    if (width <= 0 || height <= 0) {
      return;
    }

    setContainer(current =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  };

  const handleTriggerPress = React.useCallback(() => {
    if (actionCount === 0) {
      return;
    }

    if (actionCount === 1) {
      const action = actions[0];

      if (action.disabled || action.buttonProps?.disabled) {
        return;
      }

      action.onPress?.();
      return;
    }

    setIsExpanded(!isMenuOpen);
  }, [actionCount, actions, isMenuOpen]);

  const handleActionPress = React.useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleOutsidePress = React.useCallback(() => {
    if (isMenuOpen) {
      setIsExpanded(false);
    }
  }, [isMenuOpen]);

  const handleDragStart = React.useCallback(() => {
    setIsDragging(true);
    setIsExpanded(false);
  }, []);

  const handleDragEnd = React.useCallback(
    (x: number, y: number) => {
      const nextSide: FloatingSide =
        x + metrics.anchorSize / 2 < container.width / 2 ? 'left' : 'right';
      const nextGrowUp = resolveGrowUp(
        y + metrics.anchorSize / 2,
        container.height,
      );
      const nextLayout = resolveActionLayout({
        count: actionCount,
        layout,
        side: nextSide,
        metrics,
        hasLabel,
        growUp: nextGrowUp,
      });
      const nextX = snapToEdge
        ? resolveDockX(nextSide, container.width, metrics)
        : clampX(x, container.width, metrics.anchorSize);
      const centerY = resolveClampCenterY(
        y + metrics.anchorSize / 2,
        nextLayout,
        safeTop,
        safeBottom,
      );
      const nextY = centerY - metrics.anchorSize / 2;

      setIsDragging(false);
      commitPosition(nextX, nextY, nextSide);
    },
    [
      actionCount,
      commitPosition,
      container.height,
      container.width,
      hasLabel,
      layout,
      metrics,
      safeBottom,
      safeTop,
      size,
      snapToEdge,
    ],
  );

  const handleDragCancel = React.useCallback(() => {
    setIsDragging(false);
    anchorX.value = withTiming(positionRef.current.x, snapAnimation);
    anchorY.value = withTiming(positionRef.current.y, snapAnimation);
  }, [anchorX, anchorY, snapAnimation]);

  const hitSlop = React.useMemo(
    () => resolveHitSlop(metrics, side, snapToEdge),
    [metrics, side, snapToEdge],
  );

  const railAnimatedStyle = useAnimatedStyle(() => {
    const isRight =
      anchorX.value + metrics.anchorSize / 2 >= container.width / 2;

    return {
      left: isRight ? container.width - RAIL_WIDTH : 0,
      top: anchorY.value + metrics.anchorSize / 2 - RAIL_HEIGHT / 2,
      opacity: isDragging && snapToEdge ? RAIL_OPACITY : 0,
    };
  }, [anchorX, anchorY, container.width, isDragging, size, snapToEdge]);

  const scrimAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scrimProgress.value * SCRIM_OPACITY,
  }));

  if (actionCount === 0) {
    return null;
  }

  const directDisabled =
    actionCount === 1 &&
    (actions[0].disabled === true || actions[0].buttonProps?.disabled === true);
  const triggerAccessibilityLabel =
    actionCount === 1
      ? (actions[0].label ?? '执行操作')
      : isMenuOpen
        ? '收起操作'
        : '展开操作';
  const triggerStyles: FloatingActionGroupStyles['trigger'] = styles?.trigger;

  const content = (
    <View
      onLayout={handleLayout}
      pointerEvents="box-none"
      style={[rootStyles.root, style, styles?.root]}
      testID="floating-action-group-container"
    >
      {collapseOnOutsidePress ? (
        <Pressable
          onPress={handleOutsidePress}
          pointerEvents={isMenuOpen ? 'auto' : 'none'}
          style={[overlayStyles.overlay, styles?.overlay]}
          testID="floating-action-group-outside-overlay"
        >
          <Animated.View
            pointerEvents="none"
            style={[overlayStyles.scrim, scrimAnimatedStyle]}
          />
        </Pressable>
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={[railStyles.rail, railAnimatedStyle, styles?.edgeRail]}
        testID="floating-action-group-edge-rail"
      />
      {actionCount >= 2
        ? actions.map((action, index) => (
            <FloatingActionItem
              action={action}
              index={index}
              isDisabled={
                action.disabled === true ||
                action.buttonProps?.disabled === true
              }
              isOpen={isMenuOpen}
              key={action.key}
              layout={resolvedLayout.type}
              metrics={metrics}
              offset={resolvedLayout.offsets[index]}
              onActionPress={handleActionPress}
              originX={menuOriginX}
              originY={menuOriginY}
              size={size}
              spacing={spacing}
              styles={styles}
            />
          ))
        : null}
      <FloatingActionTrigger
        accessibilityLabel={triggerAccessibilityLabel}
        actionIcon={actions[0].icon}
        containerWidth={container.width}
        dragEnabled={draggable && !directDisabled}
        hitSlop={hitSlop}
        isDirect={actionCount === 1}
        isDisabled={directDisabled}
        isDocked={snapToEdge}
        isDragging={isDragging}
        isExpanded={isMenuOpen}
        metrics={metrics}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onPress={handleTriggerPress}
        safeBottom={safeBottom}
        safeTop={safeTop}
        side={side}
        size={size}
        snapToEdge={snapToEdge}
        spacing={spacing}
        style={triggerStyles}
        x={anchorX}
        y={anchorY}
      />
    </View>
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}

export type {
  FloatingActionGroupProps,
  FloatingActionGroupStyles,
  FloatingActionItem,
  FloatingPlacement,
} from './types';
