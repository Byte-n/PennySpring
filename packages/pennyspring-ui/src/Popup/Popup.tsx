import React, { useContext, useEffect, useRef } from 'react';
import {
  BackHandler,
  Pressable,
  View,
} from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
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

// 布局保留为 ReanimatedView，仅为承载 FloatingPanel 等组合组件传入的动画样式（如键盘避让 bottom 偏移）。
// Popup 自身不再提供开合动画。
const ReanimatedView = createAnimatedComponent(View);

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
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const previousOpenRef = useRef(isOpen);

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

  if (!isOpen) {
    return null;
  }

  const content = (
    <ReanimatedView style={[tokenStyles.layout, style]} testID="popup-layout">
      {mask ? (
        <Pressable
          onPress={handleMaskPress}
          style={[tokenStyles.mask, slotStyles?.mask]}
          testID="popup-mask"
        />
      ) : null}
      <View
        style={[tokenStyles.body, slotStyles?.body]}
        testID="popup-body"
      >
        {children}
      </View>
    </ReanimatedView>
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}
