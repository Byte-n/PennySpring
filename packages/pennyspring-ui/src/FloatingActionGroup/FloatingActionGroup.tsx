import React, { useContext, useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  createUseSheetStyle,
  toShadowStyle,
  useTheme,
  type AliasToken,
} from '@pennyspring/theme';
import { Button } from '../Button';
import type { ButtonColor, ButtonProps, ButtonVariant } from '../Button';
import type { IconComponent, IconName } from '../Icon';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import type { ComponentSize } from '../shares/types';
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
  alignEnd: boolean;
  expandUp: boolean;
}

interface FloatingActionButtonStyleOptions {
  shadow: boolean;
  size: ComponentSize;
}

interface FloatingActionButtonProps {
  label?: string;
  icon?: IconName | IconComponent;
  disabled?: boolean;
  color?: ButtonColor;
  variant?: ButtonVariant;
  size: ComponentSize;
  shadow?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  buttonProps?: Omit<ButtonProps, 'children' | 'icon' | 'onPress' | 'size'>;
  testID?: string;
}

const DEFAULT_VISIBLE_COUNT = 1;
const DEFAULT_PLACEMENT = 'bottomRight' as const;
const DEFAULT_SIZE = 'normal' as const;

const BUTTON_SIZE_STYLES: Record<
  ComponentSize,
  {
    height: (token: AliasToken) => number;
    paddingHorizontal: (token: AliasToken) => number;
    borderRadius: (token: AliasToken) => number;
  }
> = {
  small: {
    height: token => token.controlHeightSM,
    paddingHorizontal: token => token.paddingXS,
    borderRadius: token => token.borderRadius,
  },
  normal: {
    height: token => token.controlHeight,
    paddingHorizontal: token => token.paddingSM,
    borderRadius: token => token.borderRadiusLG,
  },
  large: {
    height: token => token.controlHeightLG,
    paddingHorizontal: token => token.paddingMD,
    borderRadius: token => token.borderRadiusLG,
  },
};

const useStyles = createUseSheetStyle(
  (token, { positionStyle, alignEnd, expandUp }: FloatingStyleOptions) => ({
    root: {
      ...positionStyle,
      position: 'absolute',
      zIndex: token.zIndexPopupBase + token.zIndexBase,
      gap: token.paddingXS,
      alignItems: alignEnd ? 'flex-end' : 'flex-start',
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
      ...(alignEnd ? { right: 0 } : { left: 0 }),
      ...(expandUp ? { top: 0 } : { bottom: 0 }),
      alignItems: alignEnd ? 'flex-end' : 'flex-start',
    },
  }),
);

const useButtonStyles = createUseSheetStyle(
  (token, { shadow, size }: FloatingActionButtonStyleOptions) => {
    const sizeStyle = BUTTON_SIZE_STYLES[size];

    return {
      button: {
        height: sizeStyle.height(token),
        borderRadius: sizeStyle.borderRadius(token),
        paddingHorizontal: sizeStyle.paddingHorizontal(token),
        ...(shadow ? toShadowStyle(token.boxShadowSecondary) : undefined),
      },
    };
  },
);

function FloatingActionButton({
  color = 'primary',
  disabled,
  icon,
  label,
  onPress,
  shadow = true,
  size,
  style,
  buttonProps,
  testID,
  variant = 'solid',
}: FloatingActionButtonProps) {
  const tokenStyles = useButtonStyles({ shadow, size });
  const {
    style: buttonStyle,
    styles: buttonStyles,
    testID: buttonTestID,
    ...restButtonProps
  } = buttonProps ?? {};
  const resolvedTestID = testID ?? buttonTestID;

  return (
    <Button
      color={color}
      {...restButtonProps}
      disabled={disabled || restButtonProps.disabled}
      icon={icon}
      onPress={onPress}
      shape="round"
      size={size}
      style={[tokenStyles.button, style, buttonStyle]}
      styles={buttonStyles}
      testID={resolvedTestID}
      variant={variant}
    >
      {label}
    </Button>
  );
}

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

function resolveHiddenItemTransform(
  index: number,
  placement: FloatingPlacement,
  spacing: number,
  gap: number,
): { x: number; y: number } {
  'worklet';

  const expandUp = placement.startsWith('bottom');
  const offsetDistance = expandUp
    ? (index + 1) * spacing
    : gap + index * spacing;
  const verticalSign = expandUp ? -1 : 1;

  return { x: 0, y: verticalSign * offsetDistance };
}

function HiddenActionItem({
  action,
  index,
  isExpanded,
  progress,
  shadowProgress,
  placement,
  spacing,
  gap,
  style,
  buttonProps,
  size,
}: {
  action: FloatingActionItem;
  index: number;
  isExpanded: boolean;
  progress: SharedValue<number>;
  shadowProgress: SharedValue<number>;
  placement: FloatingPlacement;
  spacing: number;
  gap: number;
  style: FloatingActionGroupStyles['actionButton'];
  buttonProps?: Omit<ButtonProps, 'children' | 'icon' | 'onPress' | 'size'>;
  size: ComponentSize;
}) {
  const { token } = useTheme();
  const baseShadowStyle = useMemo(
    () => toShadowStyle(token.boxShadowSecondary),
    [token.boxShadowSecondary],
  );
  const baseShadowOpacity = Number(baseShadowStyle.shadowOpacity ?? 0);
  const hiddenBorderRadius = BUTTON_SIZE_STYLES[size].borderRadius(token);

  const animatedStyle = useAnimatedStyle(() => {
    const baseTransform = resolveHiddenItemTransform(
      index,
      placement,
      spacing,
      gap,
    );

    return {
      ...baseShadowStyle,
      position: 'absolute',
      opacity: progress.value,
      borderRadius: hiddenBorderRadius,
      shadowOpacity: baseShadowOpacity * shadowProgress.value,
      transform: [
        { translateX: baseTransform.x * progress.value },
        { translateY: baseTransform.y * progress.value },
        { scale: 0.8 + progress.value * 0.2 },
      ],
    };
  }, [
    baseShadowOpacity,
    baseShadowStyle,
    gap,
    hiddenBorderRadius,
    index,
    placement,
    spacing,
  ]);

  if (!isExpanded) {
    return null;
  }

  return (
    <Animated.View
      style={animatedStyle}
      testID="floating-action-group-hidden-item"
    >
      <FloatingActionButton
        disabled={action.disabled}
        icon={action.icon}
        label={action.label}
        onPress={action.onPress}
        shadow={false}
        size={size}
        style={[style, action.buttonProps?.style]}
        buttonProps={buttonProps}
        variant="filled"
      />
    </Animated.View>
  );
}

export function FloatingActionGroup({
  actions,
  collapseOnOutsidePress = true,
  defaultVisibleCount = DEFAULT_VISIBLE_COUNT,
  mountPoint = 'auto',
  offset,
  placement = DEFAULT_PLACEMENT,
  size = DEFAULT_SIZE,
  spacing,
  style,
  styles,
  toggleOnMorePress = true,
}: FloatingActionGroupProps) {
  const portalContext = useContext(PortalContext);
  const { token } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [hiddenActionsMounted, setHiddenActionsMounted] = useState(false);
  const progress = useSharedValue(0);
  const shadowProgress = useSharedValue(0);

  const visibleCount = Math.max(DEFAULT_VISIBLE_COUNT, defaultVisibleCount);
  const visibleActions = useMemo(() => actions.slice(0, visibleCount), [actions, visibleCount]);
  const hiddenActions = useMemo(() => actions.slice(visibleCount), [actions, visibleCount]);
  const hasMore = hiddenActions.length > 0;

  const computedSpacing =
    spacing ?? BUTTON_SIZE_STYLES[size].height(token) + token.paddingXS;
  const alignEnd = !placement.endsWith('Left');
  const expandUp = placement.startsWith('bottom');

  const positionStyle = resolvePlacementPosition(
    placement,
    offset ?? {},
    token,
  );
  const tokenStyles = useStyles({ positionStyle, alignEnd, expandUp });

  const handleToggleExpand = (): void => {
    if (!hasMore) {
      return;
    }

    const nextExpanded = toggleOnMorePress ? !expanded : true;
    if (nextExpanded) {
      setHiddenActionsMounted(true);
      shadowProgress.value = 0;
    } else {
      shadowProgress.value = 0;
    }
    setExpanded(nextExpanded);
    progress.value = withTiming(nextExpanded ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    }, (finished) => {
      if (nextExpanded && finished) {
        shadowProgress.value = withTiming(1, {
          duration: token.motionDurationFast,
          easing: Easing.bezier(...token.motionEaseInOut),
        });
      }
      if (!nextExpanded && finished) {
        runOnJS(setHiddenActionsMounted)(false);
      }
    });
  };

  const handleOutsidePress = (): void => {
    if (!collapseOnOutsidePress || !expanded) {
      return;
    }

    setExpanded(false);
    shadowProgress.value = 0;
    progress.value = withTiming(0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    }, (finished) => {
      if (finished) {
        runOnJS(setHiddenActionsMounted)(false);
      }
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
        style={[tokenStyles.root, style, styles?.root, styles?.container]}
        testID="floating-action-group-container"
      >
        <View pointerEvents="box-none" style={tokenStyles.hiddenLayer}>
          {hiddenActions.map((action, index) => (
            <HiddenActionItem
              action={action}
              index={index}
              isExpanded={hiddenActionsMounted}
              key={action.key}
              progress={progress}
              shadowProgress={shadowProgress}
              placement={placement}
              spacing={computedSpacing}
              gap={token.paddingXS}
              style={styles?.actionButton}
              buttonProps={action.buttonProps}
              size={size}
            />
          ))}
        </View>
        {placement.startsWith('bottom') && hasMore ? (
          <FloatingActionButton
            label={expanded ? '收起' : '更多'}
            onPress={handleToggleExpand}
            size={size}
            style={styles?.moreButton}
            testID="floating-action-group-more-button"
            variant="filled"
          />
        ) : null}
        {visibleActions.map(action => (
          <FloatingActionButton
            disabled={action.disabled}
            icon={action.icon}
            key={action.key}
            label={action.label}
            onPress={action.onPress}
            size={size}
            style={[styles?.actionButton, action.buttonProps?.style]}
            buttonProps={action.buttonProps}
          />
        ))}
        {!placement.startsWith('bottom') && hasMore ? (
          <FloatingActionButton
            label={expanded ? '收起' : '更多'}
            onPress={handleToggleExpand}
            size={size}
            style={styles?.moreButton}
            testID="floating-action-group-more-button"
            variant="filled"
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
  FloatingPlacement,
} from './types';
