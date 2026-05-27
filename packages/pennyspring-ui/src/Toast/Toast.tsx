import type { ComponentSize } from '../shares/types';
import React, { useContext } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useOverlayEmitter } from '../_hooks/useOverlayEmitter';
import type {
  ViewStyle } from 'react-native';
import type { ToastController,
  ToastPlacement,
  ToastProps,
  ToastShowOptions,
} from './types';

const DEFAULT_DURATION = 2000;
const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_PLACEMENT: ToastPlacement = 'bottom';
const HIDDEN_OFFSET_RATIO = 0.6;
const SIZE_TOKEN_MAP: Record<
  ComponentSize,
  {
    verticalPadding: (token: ReturnType<typeof useTheme>['token']) => number;
    horizontalPadding: (token: ReturnType<typeof useTheme>['token']) => number;
    textSize: 'sm' | 'md' | 'lg';
  }
> = {
  small: {
    verticalPadding: token => token.paddingSM / 2,
    horizontalPadding: token => token.paddingSM,
    textSize: 'sm',
  },
  normal: {
    verticalPadding: token => token.padding / 2,
    horizontalPadding: token => token.padding,
    textSize: 'md',
  },
  large: {
    verticalPadding: token => token.paddingMD / 2,
    horizontalPadding: token => token.paddingMD,
    textSize: 'lg',
  },
};

function getPlacementStyle(placement: ToastPlacement): ViewStyle {
  if (placement === 'top') {
    return { top: 0 };
  }

  if (placement === 'bottom') {
    return { bottom: 0 };
  }

  return { top: '50%' };
}

const useStyles = createUseSheetStyle((token, { size, placement }: { size: ComponentSize; placement: ToastPlacement }) => {
  const sizeConfig = SIZE_TOKEN_MAP[size];

  return {
    content: {
      position: 'absolute',
      zIndex: token.zIndexPopupBase + 100,
      maxWidth: '100%',
      ...getPlacementStyle(placement),
      ...(placement === 'top'
        ? { marginTop: token.paddingXL }
        : placement === 'bottom'
        ? { marginBottom: token.paddingXL }
        : null),
      alignSelf: 'center',
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgSpotlight,
      paddingVertical: sizeConfig.verticalPadding(token),
      paddingHorizontal: sizeConfig.horizontalPadding(token),
    },
    messageText: {
      color: token.colorTextLightSolid,
      textAlign: 'center',
    },
  };
});

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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      ...(placement === 'center'
        ? [{ translateY: -token.controlHeight * HIDDEN_OFFSET_RATIO }]
        : []),
      {
        translateY: (1 - progress.value) * token.controlHeight * HIDDEN_OFFSET_RATIO,
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        tokenStyles.content,
        style,
        styles?.content,
        animatedStyle,
      ]}
    >
      {message ?? (
        <Text size={SIZE_TOKEN_MAP[size].textSize} style={[tokenStyles.messageText, styles?.messageText]}>
          {messageText}
        </Text>
      )}
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
