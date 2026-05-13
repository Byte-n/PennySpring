import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Pressable,
  View,
} from 'react-native';
import { createUseSheetStyle, toShadowStyle, useTheme } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import type {
  PopupAnimation,
  PopupCancelReason,
  PopupPosition,
  PopupProps,
} from './types';

const DEFAULT_POSITION: PopupPosition = 'bottom';
const DEFAULT_ANIMATION: PopupAnimation = 'none';
const POPUP_SIDE_WIDTH = '70%';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getSlideTransform(
  position: PopupPosition,
  progress: Animated.Value,
  slideOffset: number,
): ViewStyle['transform'] | null {
  const interpolateTo = (outputRange: readonly [number, number]) =>
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [...outputRange],
    });

  if (position === 'bottom') {
    return [{ translateY: interpolateTo([slideOffset, 0]) }] as unknown as ViewStyle['transform'];
  }

  if (position === 'top') {
    return [{ translateY: interpolateTo([-slideOffset, 0]) }] as unknown as ViewStyle['transform'];
  }

  if (position === 'left') {
    return [{ translateX: interpolateTo([-slideOffset, 0]) }] as unknown as ViewStyle['transform'];
  }

  if (position === 'right') {
    return [{ translateX: interpolateTo([slideOffset, 0]) }] as unknown as ViewStyle['transform'];
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
        zIndex: token.zIndexPopupBase + token.zIndexBase + 100,
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
        ...getBodyShapeStyle(position, token.borderRadius),
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
  const isOpenControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen === true);
  const isOpen = isOpenControlled ? (open as boolean) : internalOpen;
  const previousOpenRef = useRef(isOpen);

  const animated = animation !== 'none';
  const duration = animationDuration ?? token.motionDurationMid;
  const slideOffset = token.zIndexPopupBase;
  const progressRef = useRef(new Animated.Value(isOpen ? 1 : 0));
  const progress = progressRef.current;
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

    if (isOpen) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null;
        afterOpenChange?.(true);
      }, duration);
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start();
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        setMounted(false);
        afterOpenChange?.(false);
      }, duration);
    }
  }, [afterOpenChange, animated, duration, isOpen, progress]);

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

    if (!isOpenControlled) {
      setInternalOpen(false);
    }

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

        if (!isOpenControlled) {
          setInternalOpen(false);
        }

        onOpenChange?.(false, { reason: 'back' });
        return true;
      },
    );

    return () => subscription.remove();
  }, [isOpen, isOpenControlled, onCancel, onOpenChange]);

  const handleMaskPress = (): void => {
    if (!closeOnMaskClick) {
      return;
    }

    close('mask');
  };

  if (!isOpen && !(animated && mounted)) {
    return null;
  }

  const fadeStyle = animated ? { opacity: progress } : null;
  const slideTransform =
    animated && animation === 'slide'
      ? getSlideTransform(position, progress, slideOffset)
      : null;
  const bodyAnimatedStyle =
    animated
      ? {
          ...fadeStyle,
          ...(slideTransform ? { transform: slideTransform } : null),
        }
      : null;

  const content = (
    <View style={[tokenStyles.layout, style]} testID="popup-layout">
      {mask ? (
        <AnimatedPressable
          onPress={handleMaskPress}
          style={[tokenStyles.mask, slotStyles?.mask, fadeStyle]}
          testID="popup-mask"
        />
      ) : null}
      <Animated.View
        style={[tokenStyles.body, slotStyles?.body, bodyAnimatedStyle]}
        testID="popup-body"
      >
        {children}
      </Animated.View>
    </View>
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}
