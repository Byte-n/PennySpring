import React, { useContext, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { FloatingActionButton } from '../FloatingActionButton';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import type {
  FloatingActionGroupStyles,
  FloatingActionGroupProps,
  FloatingActionItem,
  FloatingPlacement,
} from './types';

interface FloatingStyleOptions {
  positionStyle: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

const DEFAULT_VISIBLE_COUNT = 1;
const DEFAULT_SPACING_FACTOR = 1;
const DEFAULT_RADIAL_START_ANGLE = -90;
const DEFAULT_RADIAL_SWEEP_ANGLE = 120;
const DEFAULT_DIRECTION = 'vertical' as const;
const DEFAULT_PLACEMENT = 'bottomRight' as const;

const useStyles = createUseSheetStyle(
  (token, { positionStyle }: FloatingStyleOptions) => ({
    root: {
      ...positionStyle,
      position: 'absolute',
      zIndex: token.zIndexPopupBase + token.zIndexBase,
      gap: token.paddingXS,
      alignItems: 'flex-end',
    },
    outsideOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    hiddenLayer: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      gap: token.paddingXS,
      alignItems: 'flex-end',
    },
  }),
);

function resolvePlacementPosition(
  placement: FloatingPlacement,
  offset: NonNullable<FloatingActionGroupProps['offset']>,
  token: ReturnType<typeof useTheme>['token'],
): { top?: number; right?: number; bottom?: number; left?: number } {
  const baseX = offset.x ?? token.paddingLG;
  const baseY = offset.y ?? token.paddingLG;

  if (placement === 'topLeft') return { top: baseY, left: baseX };
  if (placement === 'topRight') return { top: baseY, right: baseX };
  if (placement === 'bottomLeft') return { bottom: baseY, left: baseX };
  if (placement === 'centerLeft') return { top: token.sizeXXL, left: baseX };
  if (placement === 'centerRight') return { top: token.sizeXXL, right: baseX };

  return { bottom: baseY, right: baseX };
}

function resolvePositionStyle(
  position: FloatingActionGroupProps['position'] | undefined,
  placement: FloatingPlacement,
  offset: NonNullable<FloatingActionGroupProps['offset']>,
  token: ReturnType<typeof useTheme>['token'],
): { top?: number; right?: number; bottom?: number; left?: number } {
  if (position !== undefined) {
    return {
      top: position.top,
      right: position.right,
      bottom: position.bottom,
      left: position.left,
    };
  }

  return resolvePlacementPosition(placement, offset, token);
}

function resolveHiddenItemTransform(
  index: number,
  hiddenCount: number,
  direction: NonNullable<FloatingActionGroupProps['direction']>,
  spacing: number,
  radialRadius: number,
  radialStartAngle: number,
  radialSweepAngle: number,
): { x: number; y: number } {
  const offsetIndex = index + 1;

  if (direction === 'horizontal') {
    return { x: -(offsetIndex * spacing), y: 0 };
  }

  if (direction === 'radial') {
    const segment = hiddenCount > 1 ? radialSweepAngle / (hiddenCount - 1) : 0;
    const angle = ((radialStartAngle + segment * index) * Math.PI) / 180;

    return {
      x: Math.cos(angle) * radialRadius,
      y: Math.sin(angle) * radialRadius,
    };
  }

  return { x: 0, y: -(offsetIndex * spacing) };
}

function HiddenActionItem({
  action,
  direction,
  hiddenCount,
  index,
  isExpanded,
  progress,
  radialRadius,
  radialStartAngle,
  radialSweepAngle,
  spacing,
  style,
}: {
  action: FloatingActionItem;
  direction: NonNullable<FloatingActionGroupProps['direction']>;
  hiddenCount: number;
  index: number;
  isExpanded: boolean;
  progress: SharedValue<number>;
  radialRadius: number;
  radialStartAngle: number;
  radialSweepAngle: number;
  spacing: number;
  style: FloatingActionGroupStyles['actionButton'];
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const baseTransform = resolveHiddenItemTransform(
      index,
      hiddenCount,
      direction,
      spacing,
      radialRadius,
      radialStartAngle,
      radialSweepAngle,
    );

    return {
      opacity: progress.value,
      transform: [
        { translateX: baseTransform.x * progress.value },
        { translateY: baseTransform.y * progress.value },
        { scale: 0.8 + progress.value * 0.2 },
      ],
    };
  }, [
    direction,
    hiddenCount,
    index,
    radialRadius,
    radialStartAngle,
    radialSweepAngle,
    spacing,
  ]);

  if (!isExpanded) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle} testID="floating-action-group-hidden-item">
      <FloatingActionButton
        disabled={action.disabled}
        icon={action.icon}
        label={action.label}
        onPress={action.onPress}
        style={style}
      />
    </Animated.View>
  );
}

export function FloatingActionGroup({
  actions,
  collapseOnOutsidePress = true,
  defaultVisibleCount = DEFAULT_VISIBLE_COUNT,
  direction = DEFAULT_DIRECTION,
  mountPoint = 'auto',
  offset,
  placement = DEFAULT_PLACEMENT,
  position,
  radialRadius,
  radialStartAngle = DEFAULT_RADIAL_START_ANGLE,
  radialSweepAngle = DEFAULT_RADIAL_SWEEP_ANGLE,
  spacing,
  style,
  styles,
  toggleOnMorePress = true,
}: FloatingActionGroupProps) {
  const portalContext = useContext(PortalContext);
  const { token } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const progress = useSharedValue(0);

  const visibleCount = Math.max(DEFAULT_VISIBLE_COUNT, defaultVisibleCount);
  const visibleActions = useMemo(() => actions.slice(0, visibleCount), [actions, visibleCount]);
  const hiddenActions = useMemo(() => actions.slice(visibleCount), [actions, visibleCount]);
  const hasMore = hiddenActions.length > 0;

  const computedSpacing = spacing ?? token.controlHeightLG * DEFAULT_SPACING_FACTOR;
  const computedRadius = radialRadius ?? token.controlHeightLG * 2;

  const positionStyle = resolvePositionStyle(
    position,
    placement,
    offset ?? {},
    token,
  );
  const tokenStyles = useStyles({ positionStyle });

  const handleToggleExpand = (): void => {
    if (!hasMore) {
      return;
    }

    const nextExpanded = toggleOnMorePress ? !expanded : true;
    setExpanded(nextExpanded);
    progress.value = withTiming(nextExpanded ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  };

  const handleOutsidePress = (): void => {
    if (!collapseOnOutsidePress || !expanded) {
      return;
    }

    setExpanded(false);
    progress.value = withTiming(0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  };

  const content = (
    <>
      {expanded && collapseOnOutsidePress ? (
        <Pressable
          onPress={handleOutsidePress}
          style={tokenStyles.outsideOverlay}
          testID="floating-action-group-outside-overlay"
        />
      ) : null}
      <View
        pointerEvents="box-none"
        style={[tokenStyles.root, style, styles?.container]}
        testID="floating-action-group-container"
      >
        <View pointerEvents="box-none" style={tokenStyles.hiddenLayer}>
          {hiddenActions.map((action, index) => (
            <HiddenActionItem
              action={action}
              direction={direction}
              hiddenCount={hiddenActions.length}
              index={index}
              isExpanded={expanded}
              key={action.key}
              progress={progress}
              radialRadius={computedRadius}
              radialStartAngle={radialStartAngle}
              radialSweepAngle={radialSweepAngle}
              spacing={computedSpacing}
              style={styles?.actionButton}
            />
          ))}
        </View>
        {visibleActions.map(action => (
          <FloatingActionButton
            disabled={action.disabled}
            icon={action.icon}
            key={action.key}
            label={action.label}
            onPress={action.onPress}
            style={styles?.actionButton}
          />
        ))}
        {hasMore ? (
          <FloatingActionButton
            label={expanded ? '收起' : '更多'}
            onPress={handleToggleExpand}
            style={styles?.moreButton}
            testID="floating-action-group-more-button"
            variant={expanded ? 'filled' : 'solid'}
          />
        ) : null}
      </View>
    </>
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}

export type {
  FloatingActionGroupProps,
  FloatingActionGroupStyles,
  FloatingActionItem,
  FloatingDirection,
  FloatingPlacement,
} from './types';
