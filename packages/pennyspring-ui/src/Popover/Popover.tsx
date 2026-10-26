import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import {
  Easing,
  createAnimatedComponent,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  createUseSheetStyle,
  toShadowStyle,
  useTheme,
} from '@pennyspring/theme';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { useControllableValue } from '../_hooks';
import { measurePopoverAnchor } from './measureAnchor';
import { resolvePopoverLayout } from './popoverLayout';
import type { PopoverOpenChangeReason, PopoverProps } from './types';
import type {
  PopoverAnchorRect,
  PopoverLayout,
  PopoverPanelSize,
} from './popoverLayout';

const DEFAULT_PLACEMENT = 'bottom' as const;
const DEFAULT_ALIGN = 'center' as const;
const DEFAULT_TRIGGER = 'click' as const;

const ReanimatedView = createAnimatedComponent(View);

interface TriggerHandlers {
  onLongPress?: (event: GestureResponderEvent) => void;
  onPress?: (event: GestureResponderEvent) => void;
}

function mergeTriggerHandlers(
  child: React.ReactElement,
  onPress?: () => void,
  onLongPress?: () => void,
): React.ReactElement {
  if (onPress === undefined && onLongPress === undefined) {
    return child;
  }

  const childProps = child.props as TriggerHandlers;
  const mergedProps: TriggerHandlers = {
    onPress:
      onPress === undefined
        ? childProps.onPress
        : event => {
            childProps.onPress?.(event);
            onPress();
          },
    onLongPress:
      onLongPress === undefined
        ? childProps.onLongPress
        : event => {
            childProps.onLongPress?.(event);
            onLongPress();
          },
  };

  return React.cloneElement(child, mergedProps);
}

interface PopoverContentStyleOptions {
  left: number;
  top: number;
  maxWidth: number;
}

const useStyles = createUseSheetStyle(
  (token, { left, top, maxWidth }: PopoverContentStyleOptions) => ({
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
      left,
      top,
      maxWidth,
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      padding: token.paddingSM,
      ...toShadowStyle(token.boxShadowSecondary),
    },
  }),
);

export function Popover({
  afterOpenChange,
  align = DEFAULT_ALIGN,
  children,
  closeOnMaskClick = true,
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
}: PopoverProps) {
  const { token } = useTheme();
  const { width: viewportWidth, height: viewportHeight } =
    useWindowDimensions();
  const portalContext = useContext(PortalContext);
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;

  const anchorRef = useRef<View | null>(null);
  const [anchorRect, setAnchorRect] = useState<PopoverAnchorRect | null>(null);
  const [panelSize, setPanelSize] = useState<PopoverPanelSize | null>(null);
  const [mounted, setMounted] = useState(isOpen);
  const progress = useSharedValue(0);
  const previousOpenRef = useRef(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    progress.value = 0;
    setMounted(true);
    setAnchorRect(null);
    measurePopoverAnchor(anchorRef.current, setAnchorRect);
    // 共享值只在开关切换时重置，effect 仅响应 isOpen，避免重复测量。
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !mounted) {
      return;
    }

    progress.value = withTiming(
      0,
      {
        duration: token.motionDurationMid,
        easing: Easing.bezier(...token.motionEaseOut),
      },
      finished => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [isOpen, mounted, progress, token]);

  const isPositionReady = anchorRect !== null && panelSize !== null;

  useEffect(() => {
    if (!isOpen || !isPositionReady) {
      return;
    }

    progress.value = withTiming(1, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseOut),
    });
  }, [isOpen, isPositionReady, progress, token]);

  useEffect(() => {
    if (previousOpenRef.current === isOpen) {
      return;
    }

    previousOpenRef.current = isOpen;
    afterOpenChange?.(isOpen);
  }, [afterOpenChange, isOpen]);

  const requestOpenChange = useCallback(
    (nextOpen: boolean, reason: PopoverOpenChangeReason): void => {
      if (nextOpen === isOpen) {
        return;
      }

      if (!nextOpen) {
        onCancel?.({ reason });
      }

      setResolvedOpen(nextOpen);
      onOpenChange?.(nextOpen, { reason });
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

  const handleMaskPress = useCallback((): void => {
    if (!closeOnMaskClick) {
      return;
    }

    requestOpenChange(false, 'outside');
  }, [closeOnMaskClick, requestOpenChange]);

  const handleAnchorLayout = useCallback((): void => {
    if (!isOpen) {
      return;
    }

    measurePopoverAnchor(anchorRef.current, setAnchorRect);
  }, [isOpen]);

  const handleContentLayout = useCallback((event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;

    setPanelSize(previousSize => {
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

  const edgeInset = token.marginSM;
  const layout: PopoverLayout =
    anchorRect !== null && panelSize !== null
      ? resolvePopoverLayout({
          anchor: anchorRect,
          panel: panelSize,
          viewport: { width: viewportWidth, height: viewportHeight },
          placement,
          align,
          offset: token.marginXS,
          edgeInset,
        })
      : { left: edgeInset, top: edgeInset, placement };

  const tokenStyles = useStyles({
    left: layout.left,
    top: layout.top,
    maxWidth: Math.max(viewportWidth - edgeInset * 2, 0),
  });

  const enterOffsetX =
    layout.placement === 'left'
      ? token.marginXXS
      : layout.placement === 'right'
      ? -token.marginXXS
      : 0;
  const enterOffsetY =
    layout.placement === 'top'
      ? token.marginXXS
      : layout.placement === 'bottom'
      ? -token.marginXXS
      : 0;
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: (1 - progress.value) * enterOffsetX },
      { translateY: (1 - progress.value) * enterOffsetY },
    ],
  }));

  const anchor = (
    <View
      ref={anchorRef}
      collapsable={false}
      onLayout={handleAnchorLayout}
      testID="popover-anchor"
    >
      {React.isValidElement(children)
        ? mergeTriggerHandlers(
            children,
            trigger === 'click' ? handleTriggerPress : undefined,
            trigger === 'longPress' ? handleTriggerPress : undefined,
          )
        : children}
    </View>
  );

  const triggerNode =
    trigger === 'manual' ? (
      anchor
    ) : (
      <Pressable
        onLongPress={trigger === 'longPress' ? handleTriggerPress : undefined}
        onPress={trigger === 'click' ? handleTriggerPress : undefined}
        testID="popover-trigger"
      >
        {anchor}
      </Pressable>
    );

  if (!mounted) {
    return triggerNode;
  }

  const panel = (
    <View style={tokenStyles.overlay} testID="popover-overlay">
      <Pressable
        onPress={handleMaskPress}
        style={tokenStyles.mask}
        testID="popover-mask"
      />
      <ReanimatedView
        onLayout={handleContentLayout}
        style={[
          tokenStyles.content,
          slotStyles?.content,
          contentAnimatedStyle,
          style,
        ]}
        testID="popover-content"
      >
        {content}
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
