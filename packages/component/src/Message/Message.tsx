import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Portal } from '../Portal';
import { Text } from '../Text';
import type { MessageType, MessageProps, MessageSize } from './types';

const DEFAULT_DURATION = 3000;
const ANIMATION_DURATION = 250;

const ICON_MAP: Record<MessageType, 'info' | 'check-circle' | 'warning' | 'close-circle'> = {
  info: 'info',
  success: 'check-circle',
  warning: 'warning',
  error: 'close-circle',
};

const ICON_COLOR_MAP: Record<MessageType, string> = {
  info: 'colorInfo',
  success: 'colorSuccess',
  warning: 'colorWarning',
  error: 'colorError',
};

// [Issue 5] Removed unused fontSize field
const SIZE_CONFIG: Record<MessageSize, { iconSize: 'small' | 'normal' | 'large' }> = {
  small: { iconSize: 'small' },
  normal: { iconSize: 'normal' },
  large: { iconSize: 'large' },
};

function resolveOpen(defaultOpen?: boolean, open?: boolean): boolean {
  return open ?? defaultOpen ?? false;
}

const useStyles = createUseSheetStyle(
  (token, options: { size: MessageSize }) => {
    const sizePadding = {
      small: token.paddingXS,
      normal: token.paddingSM,
      large: token.paddingMD,
    }[options.size];

    const sizeGap = {
      small: token.sizeXXS,
      normal: token.sizeXS,
      large: token.sizeSM,
    }[options.size];

    const sizeBorderRadius = {
      small: token.borderRadiusSM,
      normal: token.borderRadius,
      large: token.borderRadiusLG,
    }[options.size];

    return {
      overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: token.zIndexPopupBase + token.zIndexBase + 100,
        paddingTop: token.paddingMD,
        paddingHorizontal: token.paddingMD,
      },
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: sizePadding,
        gap: sizeGap,
        borderRadius: sizeBorderRadius,
        backgroundColor: token.colorBgElevated,
        maxWidth: '100%',
        ...token.boxShadowSecondary,
      },
      body: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizeGap,
      },
      contentText: {
        flex: 1,
        color: token.colorText,
      },
      closeButton: {
        padding: token.paddingXXS,
      },
    };
  },
);

function getDefaultIcon(type: MessageType, size: MessageSize): React.ReactNode {
  const config = SIZE_CONFIG[size];

  return (
    <Icon
      icon={ICON_MAP[type]}
      size={config.iconSize}
      color={ICON_COLOR_MAP[type]}
      testID="message-icon"
    />
  );
}

function resolveFontSize(size: MessageSize): 'sm' | 'md' | 'lg' {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

export function Message({
  closeable = false,
  content,
  contentText,
  defaultOpen,
  duration = DEFAULT_DURATION,
  icon,
  onCancel,
  onOpenChange,
  open,
  size = 'normal',
  style,
  styles: slotStyles,
  type = 'info',
}: MessageProps) {
  const tokenStyles = useStyles({ size });
  const [internalOpen, setInternalOpen] = useState(resolveOpen(defaultOpen, open));
  const isOpenControlled = open !== undefined;
  const isOpen = isOpenControlled ? open : internalOpen;
  const [isVisible, setIsVisible] = useState(isOpen);
  const progress = useSharedValue(isOpen ? 1 : 0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // [Issue 3] Stabilize onCancel reference to prevent timer/animation resets on re-render
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  // Track whether close was initiated by the component itself (auto-dismiss / user press)
  // vs. externally by the parent changing open={false}
  const closedBySelfRef = useRef(false);

  const clearTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback((): void => {
    // [Issue 1] Semantic action callback fires first per project convention
    // Only fire onCancel for self-initiated closes (auto-dismiss, user press),
    // not when parent externally sets open={false}
    if (closedBySelfRef.current) {
      onCancelRef.current?.();
      closedBySelfRef.current = false;
    }

    onOpenChange?.(false);

    if (!isOpenControlled) {
      setInternalOpen(false);
    }

    // [Issue 4] Hide component only after animation completes
    setIsVisible(false);
  }, [isOpenControlled, onOpenChange]);

  const startCloseAnimation = useCallback((): void => {
    'worklet';

    progress.value = withTiming(0, { duration: ANIMATION_DURATION }, (finished) => {
      if (finished) {
        runOnJS(handleDismiss)();
      }
    });
  }, [handleDismiss, progress]);

  useEffect(() => {
    if (isOpen) {
      // Cancel any in-progress close animation and show the component
      closedBySelfRef.current = false;
      setIsVisible(true);
      progress.value = withTiming(1, { duration: ANIMATION_DURATION });

      if (duration > 0) {
        clearTimer();
        timerRef.current = setTimeout(() => {
          closedBySelfRef.current = true;
          startCloseAnimation();
        }, duration);
      }
    } else if (isOpenControlled) {
      // [Issue 4] Controlled mode: animate close when parent sets open={false}
      // closedBySelfRef is false (default), so handleDismiss won't fire onCancel
      startCloseAnimation();
    }
    // Uncontrolled mode: close animation is started by timer or user press,
    // which set closedBySelfRef = true before calling startCloseAnimation

    return clearTimer;
  }, [clearTimer, duration, isOpen, isOpenControlled, progress, startCloseAnimation]);

  const handleClosePress = useCallback((): void => {
    clearTimer();
    closedBySelfRef.current = true;
    startCloseAnimation();
  }, [clearTimer, startCloseAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: (1 - progress.value) * -20,
      },
    ],
  }));

  // [Issue 4] Continue rendering during close animation even when isOpen is false
  if (!isVisible) {
    return null;
  }

  const iconNode = icon ?? getDefaultIcon(type, size);
  const fontSize = resolveFontSize(size);

  return (
    <Portal>
      <Animated.View
        pointerEvents="box-none"
        style={[tokenStyles.overlay, animatedStyle]}
      >
        <View style={[tokenStyles.container, style]} testID="message-container">
          <View style={[tokenStyles.body, slotStyles?.body]}>
            {iconNode ? (
              <View style={slotStyles?.icon} testID="message-icon-wrapper">
                {iconNode}
              </View>
            ) : null}
            {content !== undefined && content !== null ? (
              content
            ) : contentText !== undefined ? (
              <Text
                size={fontSize}
                style={[tokenStyles.contentText, slotStyles?.contentText]}
                testID="message-content-text"
              >
                {contentText}
              </Text>
            ) : null}
          </View>
          {closeable ? (
            <Pressable
              hitSlop={8}
              onPress={handleClosePress}
              style={[tokenStyles.closeButton, slotStyles?.closeButton]}
              testID="message-close-button"
            >
              <Icon icon="close" size="small" color="colorTextSecondary" />
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </Portal>
  );
}
