import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
import React, { useContext } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useOverlayEmitter } from '../_hooks/useOverlayEmitter';
import type {
  ToastController,
  ToastPlacement,
  ToastProps,
  ToastShowOptions,
} from './types';
import { SIZE_TOKEN_MAP, useStyles } from './style';

const DEFAULT_DURATION = 2000;
const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_PLACEMENT: ToastPlacement = 'bottom';

interface ToastBodyProps extends ToastShowOptions {
  isOpen: boolean;
  onExited?: () => void;
}

function ToastBody({
  duration,
  isOpen,
  message,
  messageText,
  onExited,
  placement = DEFAULT_PLACEMENT,
  size = DEFAULT_SIZE,
  style,
  styles,
}: ToastBodyProps) {
  const tokenStyles = useStyles({ placement, size });
  const { token } = useTheme();
  const progress = useSharedValue(0);
  const [contentHeight, setContentHeight] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = React.useRef(false);

  const handleClosed = React.useCallback(() => {
    if (!closedRef.current) {
      closedRef.current = true;
      onExited?.();
    }
  }, [onExited]);

  React.useEffect(() => {
    const nextValue = isOpen ? 1 : 0;
    progress.value = withTiming(
      nextValue,
      {
        duration: token.motionDurationMid,
        easing: Easing.bezier(...token.motionEaseInOut),
      },
      finished => {
        'worklet';
        if (finished && !isOpen) {
          runOnJS(handleClosed)();
        }
      },
    );
  }, [handleClosed, isOpen, progress, token.motionDurationMid, token.motionEaseInOut]);

  React.useEffect(() => {
    if (duration === 0 || isOpen === false) {
      return;
    }

    timerRef.current = setTimeout(() => {
      progress.value = withTiming(
        0,
        {
          duration: token.motionDurationMid,
          easing: Easing.bezier(...token.motionEaseInOut),
        },
        finished => {
          'worklet';
          if (finished) {
            runOnJS(handleClosed)();
          }
        },
      );
    }, duration ?? DEFAULT_DURATION);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [duration, handleClosed, isOpen, progress, token.motionDurationMid, token.motionEaseInOut]);

  const animatedStyle = useAnimatedStyle(() => {
    const hiddenOffset = contentHeight > 0 ? contentHeight : token.controlHeight;

    return {
      opacity: progress.value,
      transform: [
        ...(placement === 'center'
          ? [{ translateY: -hiddenOffset }]
          : []),
        {
          translateY: (1 - progress.value) * hiddenOffset,
        },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={event => {
        const nextHeight = event.nativeEvent.layout.height;
        setContentHeight(nextHeight);
      }}
      style={[
        tokenStyles.content,
        style,
        styles?.content,
        animatedStyle,
      ]}
    >
      {renderTextNode(message ?? messageText, (text) => (
        <Text size={SIZE_TOKEN_MAP[size].textSize} style={[tokenStyles.messageText, styles?.messageText]}>
          {text}
        </Text>
      ))}
    </Animated.View>
  );
}

export function Toast({
  afterOpenChange,
  defaultOpen,
  duration,
  mountPoint = 'auto',
  message,
  messageText,
  onCancel,
  onOpenChange,
  open,
  placement,
  size,
  style,
  styles,
}: ToastProps) {
  const portalContext = useContext(PortalContext);
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const [mounted, setMounted] = React.useState(isOpen);

  React.useEffect(() => {
    afterOpenChange?.(isOpen);
  }, [afterOpenChange, isOpen]);

  React.useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  if (!isOpen && !mounted) {
    return null;
  }

  const content = (
    <ToastBody
      duration={duration}
      isOpen={isOpen}
      message={message}
      messageText={messageText}
      onExited={() => {
        onCancel?.();
        setResolvedOpen(false);
        setMounted(false);
        onOpenChange?.(false);
        afterOpenChange?.(false);
      }}
      placement={placement}
      size={size}
      style={style}
      styles={styles}
    />
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}

export function useToast(): ToastController {
  const emitter = useOverlayEmitter<ToastShowOptions>({
    render: (options, params) => {
      const { onCancel, ...restOptions } = options;

      return (
        resolvePortalMount(
          <ToastBody
            {...restOptions}
            isOpen={params.isOpen}
            onExited={() => {
              onCancel?.();
              params.onExited();
            }}
          />,
          'portal',
          true,
        )
      );
    },
  });

  return React.useMemo(
    () => ({
      show: emitter.show,
      hide: emitter.hide,
      clear: emitter.clear,
    }),
    [emitter.clear, emitter.hide, emitter.show],
  );
}
