import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { IconName } from '../Icon';
import type { TextSize } from '../Text';
import type {
  ToastPosition,
  ToastProps,
  ToastSize,
  ToastType,
} from './types';

const DEFAULT_DURATION = 2000;
const ANIMATION_DURATION = 200;
const BODY_MAX_WIDTH = '80%';

interface ToastStyleOptions {
  position: ToastPosition;
  size: ToastSize;
  type: ToastType;
}

interface ToastSizeConfig {
  padding: (token: AliasToken) => number;
  borderRadius: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  iconSize: (token: AliasToken) => number;
  textSize: TextSize;
}

interface ToastTypeConfig {
  iconName: IconName;
  color: (token: AliasToken) => string;
}

const SIZE_STYLE_MAP: Record<ToastSize, ToastSizeConfig> = {
  small: {
    padding: token => token.paddingSM,
    borderRadius: token => token.borderRadiusLG,
    gap: token => token.marginXS,
    iconSize: token => token.fontSizeLG,
    textSize: 'sm',
  },
  normal: {
    padding: token => token.paddingMD,
    borderRadius: token => token.borderRadiusLG,
    gap: token => token.marginSM,
    iconSize: token => token.fontSizeXL,
    textSize: 'md',
  },
  large: {
    padding: token => token.paddingLG,
    borderRadius: token => token.borderRadiusLG,
    gap: token => token.marginMD,
    iconSize: token => token.fontSizeHeading4,
    textSize: 'lg',
  },
};

const TYPE_CONFIG_MAP: Record<ToastType, ToastTypeConfig> = {
  info: {
    iconName: 'info',
    color: token => token.colorInfo,
  },
  success: {
    iconName: 'check-circle',
    color: token => token.colorSuccess,
  },
  fail: {
    iconName: 'close-circle',
    color: token => token.colorError,
  },
};

function getPositionStyle(position: ToastPosition): object {
  if (position === 'top') {
    return { justifyContent: 'flex-start' as const };
  }

  if (position === 'center') {
    return { justifyContent: 'center' as const };
  }

  return { justifyContent: 'flex-end' as const };
}

const useStyles = createUseSheetStyle(
  (token, { position, size, type }: ToastStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const typeConfig = TYPE_CONFIG_MAP[type];

    return {
      layout: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...getPositionStyle(position),
        alignItems: 'center',
        zIndex: token.zIndexPopupBase + token.zIndexBase + 100,
      },
      mask: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
      },
      body: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: sizeConfig.padding(token),
        borderRadius: sizeConfig.borderRadius(token),
        gap: sizeConfig.gap(token),
        backgroundColor: token.colorBgElevated,
        marginHorizontal: token.marginLG,
        marginVertical: token.marginXL,
        maxWidth: BODY_MAX_WIDTH,
      },
      icon: {
        flexShrink: 0,
      },
      contentText: {
        color: token.colorText,
        fontSize: token[sizeConfig.textSize as keyof AliasToken] as number,
        lineHeight: token[`${sizeConfig.textSize}Height` as keyof AliasToken] as number,
        flexShrink: 1,
      },
    };
  },
);

function resolveOpen(defaultOpen?: boolean, open?: boolean): boolean {
  return open ?? defaultOpen ?? false;
}

export function Toast({
  defaultOpen,
  duration = DEFAULT_DURATION,
  icon,
  mask = false,
  onCancel,
  onOpenChange,
  open,
  position = 'bottom',
  size = 'normal',
  style,
  styles: slotStyles,
  type = 'info',
  content,
  contentText,
}: ToastProps) {
  const { token } = useTheme();
  const isOpenControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(resolveOpen(defaultOpen, open));
  const isOpen = isOpenControlled ? open : internalOpen;
  const [mounted, setMounted] = useState(isOpen);
  const opacity = useSharedValue(isOpen ? 1 : 0);
  const isMountedRef = useRef(true);
  const tokenStyles = useStyles({ position, size, type });
  const sizeConfig = SIZE_STYLE_MAP[size];
  const typeConfig = TYPE_CONFIG_MAP[type];

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || duration <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      if (!isMountedRef.current) {
        return;
      }

      if (!isOpenControlled) {
        setInternalOpen(false);
      }

      onCancel?.();
      onOpenChange?.(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, isOpen, isOpenControlled, onCancel, onOpenChange]);

  const handleUnmount = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
    } else {
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION }, () => {
        runOnJS(handleUnmount)();
      });
    }
  }, [isOpen, opacity, handleUnmount]);

  if (!isOpen && !mounted) {
    return null;
  }

  const resolvedIcon = icon ?? (
    <Icon
      icon={typeConfig.iconName}
      size={sizeConfig.iconSize(token)}
      color={typeConfig.color(token)}
      style={tokenStyles.icon}
    />
  );

  const animatedBodyStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View pointerEvents="box-none" style={[tokenStyles.layout, style]} testID="toast-layout">
      {mask ? (
        <Pressable style={tokenStyles.mask} testID="toast-mask" />
      ) : null}
      <Animated.View
        style={[tokenStyles.body, slotStyles?.body, animatedBodyStyle]}
        testID="toast-body"
      >
        {resolvedIcon}
        {content ?? (
          <Text style={[tokenStyles.contentText, slotStyles?.contentText]}>
            {contentText}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
