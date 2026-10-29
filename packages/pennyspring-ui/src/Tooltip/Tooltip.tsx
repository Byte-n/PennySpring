import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BackHandler, Pressable, ScrollView, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import {
  Easing,
  createAnimatedComponent,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle, toShadowStyle, useTheme } from '@pennyspring/theme';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { Text } from '../Text';
import { isPrimitiveContent, renderTextNode } from '../shares/node';
import { useControllableValue } from '../_hooks';
import { measurePopoverAnchor } from '../Popover/measureAnchor';
import { mergeTriggerHandlers } from '../Popover/triggerHandlers';
import { resolveTooltipLayout } from './tooltipLayout';
import type {
  PopoverAnchorRect,
  PopoverViewport,
} from '../Popover/popoverLayout';
import type { PopoverOpenChangeReason, PopoverPlacement } from '../Popover/types';
import type { TextColor } from '../Text';
import type { TooltipContentSize, TooltipLayout } from './tooltipLayout';
import type { TooltipOpenChangeParams, TooltipProps, TooltipVariant } from './types';

const DEFAULT_PLACEMENT: PopoverPlacement = 'top';
const DEFAULT_ALIGN = 'center' as const;
const DEFAULT_TRIGGER = 'press' as const;
const DEFAULT_VARIANT: TooltipVariant = 'dark';

/** 14px 中文单行约 17 字，240 是两句口径说明的实用上限。 */
const TOOLTIP_MAX_WIDTH = 240;
/** 箭头旋转前的直角边长，可见部分是它的一半。 */
const TOOLTIP_ARROW_SIZE = 8;
/** 轻提示不做位移，只从 96% 放大，避免像面板一样“滑”出来。 */
const ENTER_SCALE_FROM = 0.96;

const ReanimatedView = createAnimatedComponent(View);

interface ArrowBox {
  hidden: boolean;
  left: number;
  top: number;
}

interface TooltipStyleOptions {
  arrowBox: ArrowBox | null;
  interactive: boolean;
  layout: TooltipLayout | null;
  maxWidth: number;
  placement: PopoverPlacement;
  variant: TooltipVariant;
}

function resolveArrowBox(
  layout: TooltipLayout,
  anchor: PopoverAnchorRect,
  radius: number,
): ArrowBox {
  const isVertical =
    layout.placement === 'top' || layout.placement === 'bottom';
  const centerX = anchor.x + anchor.width / 2 - layout.left;
  const centerY = anchor.y + anchor.height / 2 - layout.top;
  const half = TOOLTIP_ARROW_SIZE / 2;
  const safe = radius + half;

  return {
    hidden: isVertical
      ? centerX < safe || centerX > layout.width - safe
      : centerY < safe || centerY > layout.height - safe,
    left: centerX - half,
    top: centerY - half,
  };
}

const useStyles = createUseSheetStyle(
  (token, options: TooltipStyleOptions) => {
    const backgroundColor =
      options.variant === 'dark'
        ? token.colorBgSpotlight
        : token.colorBgElevated;
    const arrowPosition = resolveArrowPosition(
      options.placement,
      options.arrowBox,
    );
    const light = options.variant === 'light';

    return {
      overlay: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: token.zIndexPopupBase + 100,
      },
      mask: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: 'transparent',
      },
      content: {
        position: 'absolute',
        left: options.layout?.left ?? 0,
        top: options.layout?.top ?? 0,
        width: options.layout?.width,
        maxWidth: options.maxWidth,
        paddingHorizontal: token.paddingXS,
        paddingVertical: token.paddingXS / 2,
        borderRadius: token.borderRadiusSM,
        backgroundColor,
        pointerEvents: options.interactive ? 'auto' : 'none',
        ...(light
          ? {
              borderWidth: token.lineWidth,
              borderColor: token.colorBorder,
              ...toShadowStyle(token.boxShadowSecondary),
            }
          : {}),
      },
      scroll: {
        maxHeight: options.layout?.scrollMaxHeight
          ? options.layout.scrollMaxHeight
          : undefined,
      },
      arrow: {
        position: 'absolute',
        width: TOOLTIP_ARROW_SIZE,
        height: TOOLTIP_ARROW_SIZE,
        backgroundColor,
        transform: [{ rotate: '45deg' }],
        ...(light
          ? {
              borderColor: token.colorBorder,
              borderStyle: 'solid' as const,
              ...resolveArrowBorders(options.placement, token.lineWidth),
            }
          : {}),
        ...arrowPosition,
      },
    };
  },
);

function resolveArrowPosition(
  placement: PopoverPlacement,
  box: ArrowBox | null,
): Record<string, number> {
  if (box === null) {
    return { left: 0, top: 0 };
  }

  const half = TOOLTIP_ARROW_SIZE / 2;

  if (placement === 'top') {
    return { bottom: -half, left: box.left };
  }

  if (placement === 'bottom') {
    return { left: box.left, top: -half };
  }

  if (placement === 'left') {
    return { right: -half, top: box.top };
  }

  return { left: -half, top: box.top };
}

function resolveArrowBorders(
  placement: PopoverPlacement,
  lineWidth: number,
): Record<string, number> {
  if (placement === 'top') {
    return { borderBottomWidth: lineWidth, borderRightWidth: lineWidth };
  }

  if (placement === 'bottom') {
    return { borderLeftWidth: lineWidth, borderTopWidth: lineWidth };
  }

  if (placement === 'left') {
    return { borderRightWidth: lineWidth, borderTopWidth: lineWidth };
  }

  return { borderBottomWidth: lineWidth, borderLeftWidth: lineWidth };
}

export function Tooltip({
  align = DEFAULT_ALIGN,
  arrow = true,
  children,
  content,
  defaultOpen,
  mountPoint = 'auto',
  onCancel,
  onOpenChange,
  open,
  placement = DEFAULT_PLACEMENT,
  style,
  styles: slotStyles,
  trigger = DEFAULT_TRIGGER,
  variant = DEFAULT_VARIANT,
}: TooltipProps) {
  const { token } = useTheme();
  const portalContext = useContext(PortalContext);
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const hasContent = isPrimitiveContent(content)
    ? String(content).trim().length > 0
    : content !== null && content !== undefined;

  const anchorRef = useRef<View | null>(null);
  const overlayRef = useRef<View | null>(null);
  const [anchorRect, setAnchorRect] = useState<PopoverAnchorRect | null>(null);
  const [overlaySize, setOverlaySize] = useState<PopoverViewport | null>(null);
  const [contentSize, setContentSize] = useState<TooltipContentSize | null>(
    null,
  );
  const [mounted, setMounted] = useState(isOpen);
  const progress = useSharedValue(0);

  const paddingVertical = token.paddingXS / 2;
  const viewportWidth = overlaySize?.width ?? 0;
  const viewportHeight = overlaySize?.height ?? 0;
  const maxWidth =
    overlaySize === null
      ? TOOLTIP_MAX_WIDTH
      : Math.min(
          TOOLTIP_MAX_WIDTH,
          Math.max(viewportWidth - token.padding * 2, 0),
        );
  const layout: TooltipLayout | null =
    anchorRect !== null && contentSize !== null && overlaySize !== null
      ? resolveTooltipLayout({
          align,
          anchor: anchorRect,
          content: contentSize,
          placement,
          tokens: {
            edgeInset: token.marginSM,
            lineHeight: token.lineHeightSM,
            maxWidth,
            minHeight: token.lineHeightSM + paddingVertical * 2,
            offset: token.marginXS,
            paddingHorizontal: token.paddingXS,
            paddingVertical,
          },
          viewport: { width: viewportWidth, height: viewportHeight },
        })
      : null;
  const isPositioned = layout !== null && !layout.hidden;
  const arrowBox =
    layout !== null && anchorRect !== null
      ? resolveArrowBox(layout, anchorRect, token.borderRadiusSM)
      : null;

  /**
   * 触发器与浮层容器分别取窗口坐标再相减：气泡渲染在 Portal 容器内，
   * 直接用窗口坐标会在文档站手机框、分屏等非全屏容器里整体偏移。
   */
  const measurePosition = useCallback((): void => {
    measurePopoverAnchor(anchorRef.current, anchorInWindow => {
      measurePopoverAnchor(overlayRef.current, overlayInWindow => {
        // Portal 首次挂载时容器可能还没布局，量到 0 会把气泡锁成一条并让内容按 0 宽测量。
        if (overlayInWindow.width <= 0 || overlayInWindow.height <= 0) {
          return;
        }

        if (anchorInWindow.width <= 0 || anchorInWindow.height <= 0) {
          return;
        }

        setOverlaySize({
          height: overlayInWindow.height,
          width: overlayInWindow.width,
        });
        setAnchorRect({
          height: anchorInWindow.height,
          width: anchorInWindow.width,
          x: anchorInWindow.x - overlayInWindow.x,
          y: anchorInWindow.y - overlayInWindow.y,
        });
      });
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    progress.value = 0;
    setMounted(true);
    setAnchorRect(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mounted) {
      return;
    }

    measurePosition();
  }, [isOpen, measurePosition, mounted]);

  useEffect(() => {
    if (isOpen || !mounted) {
      return;
    }

    progress.value = withTiming(
      0,
      {
        duration: token.motionDurationFast,
        easing: Easing.bezier(...token.motionEaseOut),
      },
      finished => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [isOpen, mounted, progress, token]);

  useEffect(() => {
    if (!isOpen || !isPositioned) {
      return;
    }

    progress.value = withTiming(1, {
      duration: token.motionDurationFast,
      easing: Easing.bezier(...token.motionEaseOut),
    });
  }, [isOpen, isPositioned, progress, token]);

  const requestOpenChange = useCallback(
    (nextOpen: boolean, reason: PopoverOpenChangeReason): void => {
      if (nextOpen === isOpen) {
        return;
      }

      if (!nextOpen) {
        onCancel?.({ reason });
      }

      setResolvedOpen(nextOpen);
      const params: TooltipOpenChangeParams = { reason };
      onOpenChange?.(nextOpen, params);
    },
    [isOpen, onCancel, onOpenChange, setResolvedOpen],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        requestOpenChange(false, 'back');
        return true;
      },
    );

    return () => subscription.remove();
  }, [isOpen, requestOpenChange]);

  const handleTriggerPress = useCallback((): void => {
    requestOpenChange(!isOpen, 'trigger');
  }, [isOpen, requestOpenChange]);

  const handleTriggerLongPress = useCallback((): void => {
    if (!isOpen) {
      requestOpenChange(true, 'trigger');
    }
  }, [isOpen, requestOpenChange]);

  const handleTriggerTap = useCallback((): void => {
    if (isOpen) {
      requestOpenChange(false, 'trigger');
    }
  }, [isOpen, requestOpenChange]);

  const handleMaskPress = useCallback((): void => {
    requestOpenChange(false, 'outside');
  }, [requestOpenChange]);

  const handleAnchorLayout = useCallback((): void => {
    if (!isOpen) {
      return;
    }

    measurePosition();
  }, [isOpen, measurePosition]);

  const handleContentLayout = useCallback((event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;

    if (width <= 0) {
      return;
    }

    setContentSize(previousSize => {
      if (
        previousSize !== null &&
        previousSize.width === width &&
        previousSize.height === height
      ) {
        return previousSize;
      }

      return { width, height };
    });
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale:
          ENTER_SCALE_FROM + progress.value * (1 - ENTER_SCALE_FROM),
      },
    ],
  }));

  const tokenStyles = useStyles({
    arrowBox,
    interactive: isPositioned,
    layout,
    maxWidth,
    placement: layout?.placement ?? placement,
    variant,
  });

  const triggerHandlers: {
    onLongPress?: () => void;
    onPress?: () => void;
  } =
    trigger === 'manual'
      ? {}
      : trigger === 'longPress'
      ? {
          onLongPress: handleTriggerLongPress,
          onPress: handleTriggerTap,
        }
      : { onPress: handleTriggerPress };

  const anchor = (
    <View
      ref={anchorRef}
      collapsable={false}
      onLayout={handleAnchorLayout}
      testID="tooltip-anchor"
    >
      {React.isValidElement(children)
        ? mergeTriggerHandlers(
            children,
            triggerHandlers.onPress,
            triggerHandlers.onLongPress,
          )
        : children}
    </View>
  );

  const triggerNode =
    trigger === 'manual' ? (
      anchor
    ) : (
      <Pressable
        onLongPress={triggerHandlers.onLongPress}
        onPress={triggerHandlers.onPress}
        testID="tooltip-trigger"
      >
        {anchor}
      </Pressable>
    );

  if (!mounted || !hasContent) {
    return triggerNode;
  }

  const textColor: TextColor = variant === 'dark' ? 'lightSolid' : 'default';
  const body = (
    <View onLayout={handleContentLayout} testID="tooltip-body">
      {renderTextNode(content, text => (
        <Text color={textColor} size="sm">
          {text}
        </Text>
      ))}
    </View>
  );
  const isArrowVisible =
    arrow && (layout === null || arrowBox === null || !arrowBox.hidden);
  const isScrollable = layout?.scrollable === true;

  const panel = (
    <View
      ref={overlayRef}
      collapsable={false}
      onLayout={measurePosition}
      style={tokenStyles.overlay}
      testID="tooltip-overlay"
    >
      <Pressable
        onPress={handleMaskPress}
        style={tokenStyles.mask}
        testID="tooltip-mask"
      />
      <ReanimatedView
        style={[
          tokenStyles.content,
          slotStyles?.content,
          contentAnimatedStyle,
          style,
        ]}
        testID="tooltip-content"
      >
        {isArrowVisible ? (
          <View style={tokenStyles.arrow} testID="tooltip-arrow" />
        ) : null}
        {isScrollable ? (
          <ScrollView
            scrollEnabled
            showsVerticalScrollIndicator
            style={tokenStyles.scroll}
            testID="tooltip-scroll"
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </ReanimatedView>
    </View>
  );

  return (
    <>
      {triggerNode}
      {resolvePortalMount(panel, mountPoint, portalContext !== null)}
    </>
  );
}
