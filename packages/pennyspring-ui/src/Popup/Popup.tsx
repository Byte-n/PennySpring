import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  View,
} from 'react-native';
import {
  cancelAnimation,
  createAnimatedComponent,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle, toShadowStyle, useTheme } from '@pennyspring/theme';
import type { StyleProp, ViewStyle } from 'react-native';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { useControllableValue } from '../_hooks';
import type {
  PopupAnimation,
  PopupCancelReason,
  PopupPosition,
  PopupProps,
} from './types';

const DEFAULT_POSITION: PopupPosition = 'bottom';
const DEFAULT_ANIMATION: PopupAnimation = 'none';
const POPUP_SIDE_WIDTH = '70%';

const ReanimatedView = createAnimatedComponent(View);

function getSlideTransform(
  position: PopupPosition,
  slideOffset: number,
): { prop: 'translateX' | 'translateY'; from: number } | null {
  if (position === 'bottom') {
    return { prop: 'translateY', from: slideOffset };
  }

  if (position === 'top') {
    return { prop: 'translateY', from: -slideOffset };
  }

  if (position === 'left') {
    return { prop: 'translateX', from: -slideOffset };
  }

  if (position === 'right') {
    return { prop: 'translateX', from: slideOffset };
  }

  // center slides don't make sense — fall back to fade only
  return null;
}

interface PopupStyleOptions {
  position: PopupPosition;
}

function getLayoutStyle(position: PopupPosition): ViewStyle {
  if (position === 'top') {
    return { justifyContent: 'flex-start' };
  }

  if (position === 'left') {
    return { flexDirection: 'row', justifyContent: 'flex-start' };
  }

  if (position === 'right') {
    return { flexDirection: 'row', justifyContent: 'flex-end' };
  }

  if (position === 'center') {
    return { justifyContent: 'center', alignItems: 'center' };
  }

  return { justifyContent: 'flex-end' };
}

function getBodyShapeStyle(position: PopupPosition, radius: number): ViewStyle {
  if (position === 'top') {
    return {
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
    };
  }

  if (position === 'left') {
    return {
      borderTopRightRadius: radius,
      borderBottomRightRadius: radius,
      width: POPUP_SIDE_WIDTH,
      height: '100%',
    };
  }

  if (position === 'right') {
    return {
      borderTopLeftRadius: radius,
      borderBottomLeftRadius: radius,
      width: POPUP_SIDE_WIDTH,
      height: '100%',
    };
  }

  if (position === 'center') {
    return {
      borderRadius: radius,
    };
  }

  return {
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
  };
}

const usePopupStyles = createUseSheetStyle(
  (token, { position }: PopupStyleOptions) => {
    return {
      layout: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        ...getLayoutStyle(position),
        zIndex: token.zIndexPopupBase + 100,
      },
      mask: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: token.colorBgMask,
      },
      body: {
        ...getBodyShapeStyle(position, token.borderRadiusLG * 2),
        padding: token.paddingMD,
        backgroundColor: token.colorBgElevated,
        ...toShadowStyle(token.boxShadow),
      },
    };
  },
);

export function Popup({
  afterOpenChange,
  animation = DEFAULT_ANIMATION,
  animationDuration,
  children,
  closeOnMaskClick = true,
  defaultOpen,
  mask = true,
  mountPoint = 'auto',
  onCancel,
  onOpenChange,
  open,
  position = DEFAULT_POSITION,
  style,
  styles: slotStyles,
}: PopupProps) {
  const portalContext = useContext(PortalContext);
  const tokenStyles = usePopupStyles({ position });
  const { token } = useTheme();
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const previousOpenRef = useRef(isOpen);

  const animated = animation !== 'none';
  const duration = animationDuration ?? token.motionDurationMid;
  const slideOffset = token.zIndexPopupBase;
  const progress = useSharedValue(isOpen ? 1 : 0);
  const [mounted, setMounted] = useState(isOpen);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (previousOpenRef.current === isOpen) {
      return;
    }

    previousOpenRef.current = isOpen;

    if (!animated) {
      afterOpenChange?.(isOpen);
      return;
    }

    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }

    const easing = Easing.bezier(...token.motionEaseOut);

    if (isOpen) {
      setMounted(true);
      cancelAnimation(progress);
      progress.value = withTiming(1, { duration, easing });
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        afterOpenChange?.(true);
      }, duration);
    } else {
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration, easing });
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setMounted(false);
        afterOpenChange?.(false);
      }, duration);
    }
  }, [afterOpenChange, animated, duration, isOpen, progress, token.motionEaseOut]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
      if (openTimerRef.current !== null) {
        clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const close = (reason: PopupCancelReason): void => {
    onCancel?.({ reason });

    setResolvedOpen(false);
    onOpenChange?.(false, { reason });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onCancel?.({ reason: 'back' });

        setResolvedOpen(false);
        onOpenChange?.(false, { reason: 'back' });
        return true;
      },
    );

    return () => subscription.remove();
  }, [isOpen, onCancel, onOpenChange, setResolvedOpen]);

  const handleMaskPress = (): void => {
    if (!closeOnMaskClick) {
      return;
    }

    close('mask');
  };

  const slideConfig =
    animated && animation === 'slide'
      ? getSlideTransform(position, slideOffset)
      : null;

  const maskAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animated ? progress.value : 1,
  }));

  const bodyAnimatedStyle = useAnimatedStyle(() => {
    if (!animated) {
      return { opacity: 1 };
    }

    const base: ViewStyle = { opacity: progress.value };

    if (slideConfig) {
      const translate = progress.value * slideConfig.from;
      if (slideConfig.prop === 'translateY') {
        base.transform = [{ translateY: translate }];
      } else {
        base.transform = [{ translateX: translate }];
      }
    }

    return base;
  });

  if (!isOpen && !(animated && mounted)) {
    return null;
  }

  const content = (
    <ReanimatedView style={[tokenStyles.layout, style]} testID="popup-layout">
      {mask ? (
        <Pressable
          onPress={handleMaskPress}
          style={[tokenStyles.mask, slotStyles?.mask, maskAnimatedStyle as unknown as StyleProp<ViewStyle>]}
          testID="popup-mask"
        />
      ) : null}
      <ReanimatedView
        style={[tokenStyles.body, slotStyles?.body, bodyAnimatedStyle as unknown as StyleProp<ViewStyle>]}
        testID="popup-body"
      >
        {children}
      </ReanimatedView>
    </ReanimatedView>
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}
