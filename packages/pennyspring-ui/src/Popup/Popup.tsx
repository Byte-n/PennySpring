import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  View,
} from 'react-native';
import {
  createAnimatedComponent,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { createUseSheetStyle, toShadowStyle, useTheme } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { useControllableValue } from '../_hooks';
import type {
  PopupCancelReason,
  PopupPosition,
  PopupProps,
} from './types';

const DEFAULT_POSITION: PopupPosition = 'bottom';
const POPUP_SIDE_WIDTH = '70%';

const ReanimatedView = createAnimatedComponent(View);
const ReanimatedPressable = createAnimatedComponent(Pressable);

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
  animation,
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
  const theme = useTheme();
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const previousOpenRef = useRef(isOpen);

  const [mounted, setMounted] = useState(isOpen);
  const animProgress = useSharedValue(isOpen ? 1 : 0);

  const durationEnter = theme.token.motionDurationMid;
  const durationExit = theme.token.motionDurationMid;
  const easeEnterArray: [number, number, number, number] = [...theme.token.motionEaseOut];
  const easeExitArray: [number, number, number, number] = [...theme.token.motionEaseOut];

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      animProgress.value = withTiming(
        1,
        {
          duration: durationEnter,
          easing: Easing.bezier(...easeEnterArray),
        },
      );
    } else if (mounted) {
      animProgress.value = withTiming(
        0,
        {
          duration: durationExit,
          easing: Easing.bezier(...easeExitArray),
        },
        finished => {
          if (finished) {
            runOnJS(setMounted)(false);
          }
        },
      );
    }
  }, [isOpen, mounted, animProgress, durationEnter, durationExit, easeEnterArray, easeExitArray]);

  const maskAnimatedStyle = useAnimatedStyle(() => {
    if (!animation) {
      return {};
    }
    return {
      opacity: animProgress.value,
    };
  });

  const bodyAnimatedStyle = useAnimatedStyle(() => {
    if (!animation) {
      return {};
    }

    if (animation === 'opacity') {
      return {
        opacity: animProgress.value,
      };
    }

    if (animation === 'fade') {
      const translateY = (1 - animProgress.value) * 100;
      return {
        opacity: animProgress.value,
        transform: [{ translateY }],
      };
    }

    return {};
  });

  useEffect(() => {
    if (previousOpenRef.current === isOpen) {
      return;
    }

    previousOpenRef.current = isOpen;
    afterOpenChange?.(isOpen);
  }, [afterOpenChange, isOpen]);

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

  if (!mounted) {
    return null;
  }

  const content = (
    <ReanimatedView style={[tokenStyles.layout, style]} testID="popup-layout">
      {mask ? (
        <ReanimatedPressable
          onPress={handleMaskPress}
          style={[tokenStyles.mask, slotStyles?.mask, maskAnimatedStyle]}
          testID="popup-mask"
        />
      ) : null}
      <ReanimatedView
        style={[tokenStyles.body, slotStyles?.body, bodyAnimatedStyle]}
        testID="popup-body"
      >
        {children}
      </ReanimatedView>
    </ReanimatedView>
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}
