import React, { useContext, useEffect, useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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
import { Icon } from '../Icon';
import type { IconComponent, IconName } from '../Icon';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { Row } from '../Row';
import { Text } from '../Text';
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
  iconOnly: boolean;
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
  buttonProps?: Omit<
    ButtonProps,
    'children' | 'icon' | 'onPress' | 'size' | 'style' | 'styles'
  >;
  testID?: string;
}

const DEFAULT_VISIBLE_COUNT = 1;
const DEFAULT_PLACEMENT = 'bottomRight' as const;
const DEFAULT_SIZE = 'normal' as const;
const PILL_RADIUS = 999;
const EXPANDED_ITEM_GAP = 10;
const EXPAND_STAGGER = 30;
const EXPAND_OFFSET = 8;
const HIDDEN_SCALE_START = 0.94;
const MORE_ICON_ROTATION = '45deg';
const IDLE_ICON_ROTATION = '0deg';

/**
 * 主 FAB 40 / 48 / 56；AliasToken 只覆盖 12 / 16 圆角，
 * 40 / 48 / 56 落在 4px 网格，用命名常量表达。
 */
const BUTTON_SIZE_STYLES: Record<
  ComponentSize,
  {
    height: number;
    iconSize: number;
    borderRadius: (token: AliasToken) => number;
    paddingHorizontal: (token: AliasToken) => number;
  }
> = {
  small: {
    height: 40,
    iconSize: 18,
    borderRadius: token => token.borderRadius,
    paddingHorizontal: token => token.paddingXS,
  },
  normal: {
    height: 48,
    iconSize: 22,
    borderRadius: token => token.borderRadiusLG,
    paddingHorizontal: token => token.paddingSM,
  },
  large: {
    height: 56,
    iconSize: 24,
    borderRadius: token => token.borderRadiusLG,
    paddingHorizontal: token => token.paddingMD,
  },
};

const HIDDEN_ITEM_SIZES: Record<
  ComponentSize,
  { height: number; iconSize: number }
> = {
  small: { height: 40, iconSize: 18 },
  normal: { height: 44, iconSize: 20 },
  large: { height: 48, iconSize: 22 },
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
  (token, { iconOnly, shadow, size }: FloatingActionButtonStyleOptions) => {
    const sizeStyle = BUTTON_SIZE_STYLES[size];

    return {
      button: {
        width: iconOnly ? sizeStyle.height : undefined,
        height: sizeStyle.height,
        borderRadius: sizeStyle.borderRadius(token),
        paddingHorizontal: iconOnly ? 0 : sizeStyle.paddingHorizontal(token),
        ...(shadow ? toShadowStyle(token.boxShadowSecondary) : undefined),
      },
    };
  },
);

const useMoreButtonStyles = createUseSheetStyle(
  (token, { expanded, size }: { expanded: boolean; size: ComponentSize }) => {
    const sizeStyle = BUTTON_SIZE_STYLES[size];

    return {
      button: {
        width: sizeStyle.height,
        height: sizeStyle.height,
        borderRadius: sizeStyle.borderRadius(token),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: token.colorPrimary,
        ...toShadowStyle(token.boxShadowSecondary),
      },
      icon: {
        transform: [{ rotate: expanded ? MORE_ICON_ROTATION : IDLE_ICON_ROTATION }],
      },
    };
  },
);

const useHiddenItemStyles = createUseSheetStyle(
  (token, { size }: { size: ComponentSize }) => {
    const itemSize = HIDDEN_ITEM_SIZES[size];
    // 小档复用 12 圆角 token，中/大档 14 无 token 档位。
    const borderRadius = size === 'small' ? token.borderRadius : 14;

    return {
      row: {
        alignItems: 'center',
        gap: token.paddingXS,
      },
      capsule: {
        height: token.sizeXL,
        justifyContent: 'center',
        paddingHorizontal: token.paddingSM,
        borderRadius: PILL_RADIUS,
        borderWidth: token.lineWidth,
        borderColor: token.colorSplit,
        backgroundColor: token.colorBgContainer,
      },
      mini: {
        width: itemSize.height,
        height: itemSize.height,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius,
        borderWidth: token.lineWidth,
        borderColor: token.colorSplit,
        backgroundColor: token.colorBgContainer,
      },
      miniPressed: {
        transform: [{ scale: 0.97 }],
      },
      disabled: {
        opacity: token.opacityLoading,
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
  const iconOnly = icon !== undefined;
  const tokenStyles = useButtonStyles({ iconOnly, shadow, size });
  const { testID: buttonTestID, ...restButtonProps } = buttonProps ?? {};
  const resolvedTestID = testID ?? buttonTestID;

  return (
    <Button
      color={color}
      {...restButtonProps}
      disabled={disabled || restButtonProps.disabled}
      icon={icon}
      iconProps={{ size: BUTTON_SIZE_STYLES[size].iconSize }}
      onPress={onPress}
      shape={iconOnly ? 'circle' : 'round'}
      size={size}
      style={[tokenStyles.button, style]}
      testID={resolvedTestID}
      variant={variant}
    >
      {iconOnly ? null : label}
    </Button>
  );
}

function MoreActionButton({
  expanded,
  onPress,
  size,
  style,
  testID,
}: {
  expanded: boolean;
  onPress: () => void;
  size: ComponentSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const tokenStyles = useMoreButtonStyles({ expanded, size });

  return (
    <Pressable
      onPress={onPress}
      style={[tokenStyles.button, style]}
      testID={testID}
    >
      <Icon
        color="lightSolid"
        icon="plus"
        size={BUTTON_SIZE_STYLES[size].iconSize}
        style={tokenStyles.icon}
      />
    </Pressable>
  );
}

function resolvePlacementPosition(
  placement: FloatingPlacement,
  offset: NonNullable<FloatingActionGroupProps['offset']>,
  token: AliasToken,
  safeAreaTop: number,
  safeAreaBottom: number,
): { top?: number; right?: number; bottom?: number; left?: number } {
  const baseX = offset.x ?? token.padding;
  const baseY = offset.y ?? token.padding;

  if (placement === 'topLeft') {
    return { top: baseY + safeAreaTop, left: baseX };
  }
  if (placement === 'topRight') {
    return { top: baseY + safeAreaTop, right: baseX };
  }
  if (placement === 'bottomLeft') {
    return { bottom: baseY + safeAreaBottom, left: baseX };
  }
  if (placement === 'centerLeft') {
    return { top: baseY + safeAreaTop, left: baseX };
  }
  if (placement === 'centerRight') {
    return { top: baseY + safeAreaTop, right: baseX };
  }

  return { bottom: baseY + safeAreaBottom, right: baseX };
}

function resolveHiddenItemOffset(
  index: number,
  placement: FloatingPlacement,
  spacing: number,
): number {
  'worklet';

  const expandUp = placement.startsWith('bottom');
  const verticalSign = expandUp ? -1 : 1;

  return verticalSign * (index + 1) * spacing;
}

function HiddenActionItem({
  action,
  index,
  isMounted,
  isVisible,
  placement,
  spacing,
  style,
  size,
}: {
  action: FloatingActionItem;
  index: number;
  isMounted: boolean;
  isVisible: boolean;
  placement: FloatingPlacement;
  spacing: number;
  style: FloatingActionGroupStyles['actionButton'];
  size: ComponentSize;
}) {
  const { token } = useTheme();
  const tokenStyles = useHiddenItemStyles({ size });
  const itemProgress = useSharedValue(0);
  const animationEasing = useMemo(
    () => Easing.bezier(...token.motionEaseOut),
    [token.motionEaseOut],
  );

  useEffect(() => {
    itemProgress.value = isVisible
      ? withDelay(
          index * EXPAND_STAGGER,
          withTiming(1, {
            duration: token.motionDurationMid,
            easing: animationEasing,
          }),
        )
      : withTiming(0, {
          duration: token.motionDurationMid,
          easing: animationEasing,
        });
  }, [
    animationEasing,
    index,
    isVisible,
    itemProgress,
    token.motionDurationMid,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const baseOffset = resolveHiddenItemOffset(index, placement, spacing);
    const isExpandUp = placement.startsWith('bottom');
    const enterOffset = (1 - itemProgress.value) * EXPAND_OFFSET;

    return {
      position: 'absolute',
      opacity: itemProgress.value,
      transform: [
        {
          // 展开时从主 FAB 一侧浮出 8px；收起时原路退回。
          translateY: baseOffset + (isExpandUp ? enterOffset : -enterOffset),
        },
        {
          scale:
            HIDDEN_SCALE_START +
            itemProgress.value * (1 - HIDDEN_SCALE_START),
        },
      ],
    };
  }, [index, placement, spacing]);

  const itemSize = HIDDEN_ITEM_SIZES[size];
  const isDisabled = action.disabled === true;

  if (!isMounted) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle} testID="floating-action-group-hidden-item">
      <Row gap="small" style={tokenStyles.row}>
        {action.label === undefined ? null : (
          <View style={[tokenStyles.capsule, isDisabled ? tokenStyles.disabled : null]}>
            <Text color="default" size="sm" weight="medium">
              {action.label}
            </Text>
          </View>
        )}
        <Pressable
          disabled={isDisabled}
          onPress={action.onPress}
          style={({ pressed }) => [
            tokenStyles.mini,
            pressed ? tokenStyles.miniPressed : null,
            isDisabled ? tokenStyles.disabled : null,
            style,
          ]}
        >
          <Icon
            color="default"
            icon={action.icon ?? 'plus'}
            size={itemSize.iconSize}
          />
        </Pressable>
      </Row>
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
  const safeAreaInsets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [hiddenActionsMounted, setHiddenActionsMounted] = useState(false);
  const progress = useSharedValue(0);

  const visibleCount = Math.max(DEFAULT_VISIBLE_COUNT, defaultVisibleCount);
  const visibleActions = useMemo(() => actions.slice(0, visibleCount), [actions, visibleCount]);
  const hiddenActions = useMemo(() => actions.slice(visibleCount), [actions, visibleCount]);
  const hasMore = hiddenActions.length > 0;

  const computedSpacing =
    spacing ?? HIDDEN_ITEM_SIZES[size].height + EXPANDED_ITEM_GAP;
  const alignEnd = !placement.endsWith('Left');
  const expandUp = placement.startsWith('bottom');

  const positionStyle = resolvePlacementPosition(
    placement,
    offset ?? {},
    token,
    safeAreaInsets.top,
    safeAreaInsets.bottom,
  );
  const tokenStyles = useStyles({ positionStyle, alignEnd, expandUp });

  const collapse = (): void => {
    setExpanded(false);
    progress.value = withTiming(
      0,
      {
        duration: token.motionDurationMid,
        easing: Easing.bezier(...token.motionEaseOut),
      },
      finished => {
        if (finished) {
          runOnJS(setHiddenActionsMounted)(false);
        }
      },
    );
  };

  const handleToggleExpand = (): void => {
    if (!hasMore) {
      return;
    }

    const nextExpanded = toggleOnMorePress ? !expanded : true;

    if (!nextExpanded) {
      collapse();
      return;
    }

    progress.value = 1;
    setHiddenActionsMounted(true);
    setExpanded(true);
  };

  const handleOutsidePress = (): void => {
    if (!collapseOnOutsidePress || !expanded) {
      return;
    }

    collapse();
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
        style={[tokenStyles.root, style, styles?.root]}
        testID="floating-action-group-container"
      >
        <View style={tokenStyles.hiddenLayer}>
          {hiddenActions.map((action, index) => (
            <HiddenActionItem
              action={action}
              index={index}
              isMounted={hiddenActionsMounted}
              isVisible={expanded}
              key={action.key}
              placement={placement}
              spacing={computedSpacing}
              style={styles?.actionButton}
              size={size}
            />
          ))}
        </View>
        {placement.startsWith('bottom') && hasMore ? (
          <MoreActionButton
            expanded={expanded}
            onPress={handleToggleExpand}
            size={size}
            style={styles?.moreButton}
            testID="floating-action-group-more-button"
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
            style={styles?.actionButton}
            buttonProps={action.buttonProps}
          />
        ))}
        {!placement.startsWith('bottom') && hasMore ? (
          <MoreActionButton
            expanded={expanded}
            onPress={handleToggleExpand}
            size={size}
            style={styles?.moreButton}
            testID="floating-action-group-more-button"
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
