import type { ComponentSize } from '../shares/types';
import React, { useContext } from 'react';
import { View } from 'react-native';
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
  MessageController,
  MessagePlacement,
  MessageProps,
  MessageShowOptions,
  MessageType,
} from './types';

const DEFAULT_DURATION = 2400;
const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_TYPE: MessageType = 'default';
const DEFAULT_PLACEMENT: MessagePlacement = 'top';
const SIZE_MAP: Record<
  ComponentSize,
  {
    dotSize: (token: ReturnType<typeof useTheme>['token']) => number;
    gap: (token: ReturnType<typeof useTheme>['token']) => number;
    horizontalPadding: (token: ReturnType<typeof useTheme>['token']) => number;
    textSize: 'sm' | 'md' | 'lg';
    verticalPadding: (token: ReturnType<typeof useTheme>['token']) => number;
  }
> = {
  small: {
    dotSize: token => token.fontSizeSM,
    gap: token => token.marginXXS,
    horizontalPadding: token => token.paddingSM,
    textSize: 'sm',
    verticalPadding: token => token.paddingXXS,
  },
  normal: {
    dotSize: token => token.fontSize,
    gap: token => token.marginXS,
    horizontalPadding: token => token.paddingMD,
    textSize: 'md',
    verticalPadding: token => token.paddingXS,
  },
  large: {
    dotSize: token => token.fontSizeLG,
    gap: token => token.marginSM,
    horizontalPadding: token => token.paddingLG,
    textSize: 'lg',
    verticalPadding: token => token.paddingSM,
  },
};

function resolveTypeColor(token: ReturnType<typeof useTheme>['token'], type: MessageType): string {
  if (type === 'success') return token.colorSuccess;
  if (type === 'warning') return token.colorWarning;
  if (type === 'error') return token.colorError;
  if (type === 'info') return token.colorInfo;
  return token.colorPrimary;
}

const useStyles = createUseSheetStyle((
  token,
  { size, placement, type }: {
    size: ComponentSize;
    placement: MessagePlacement;
    type: MessageType;
  },
) => {
  const sizeConfig = SIZE_MAP[size];
  const dotSize = sizeConfig.dotSize(token);

  return {
    content: {
      position: 'absolute',
      zIndex: token.zIndexPopupBase + 120,
      left: token.paddingLG,
      right: token.paddingLG,
      ...(placement === 'top'
        ? { top: token.paddingXL }
        : { bottom: token.paddingXL }),
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgElevated,
      borderWidth: token.lineWidth,
      borderColor: token.colorBorderSecondary,
      paddingVertical: sizeConfig.verticalPadding(token),
      paddingHorizontal: sizeConfig.horizontalPadding(token),
      flexDirection: 'row',
      alignItems: 'center',
      gap: sizeConfig.gap(token),
    },
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize,
      backgroundColor: resolveTypeColor(token, type),
    },
    messageText: {
      color: token.colorText,
      flex: 1,
    },
  };
});

interface MessageBodyProps extends MessageShowOptions {
  isOpen: boolean;
  onCloseStart?: () => void;
  onExited?: () => void;
}

function MessageBody({
  duration,
  isOpen,
  message,
  messageText,
  onCloseStart,
  onExited,
  placement = DEFAULT_PLACEMENT,
  size = DEFAULT_SIZE,
  style,
  styles,
  type = DEFAULT_TYPE,
}: MessageBodyProps) {
  const tokenStyles = useStyles({ size, placement, type });
  const { token } = useTheme();
  const progress = useSharedValue(0);
  const closedRef = React.useRef(false);

  const handleClosed = React.useCallback(() => {
    if (!closedRef.current) {
      closedRef.current = true;
      onExited?.();
    }
  }, [onExited]);

  React.useEffect(() => {
    progress.value = withTiming(
      isOpen ? 1 : 0,
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
    if (duration === 0) {
      return;
    }

    const timer = setTimeout(() => {
      if (onCloseStart !== undefined) {
        onCloseStart();
        return;
      }

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

    return () => clearTimeout(timer);
  }, [duration, handleClosed, onCloseStart, progress, token.motionDurationMid, token.motionEaseInOut]);

  const animatedStyle = useAnimatedStyle(() => {
    const distance = (1 - progress.value) * token.controlHeightSM;

    return {
      opacity: progress.value,
      transform: [{ translateY: placement === 'top' ? -distance : distance }],
    };
  });

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
      <View style={tokenStyles.dot} />
      {message ?? (
        <Text
          size={SIZE_MAP[size].textSize}
          style={[tokenStyles.messageText, styles?.messageText]}
        >
          {messageText}
        </Text>
      )}
    </Animated.View>
  );
}

export function Message({
  defaultOpen,
  mountPoint = 'auto',
  onCancel,
  open,
  onOpenChange,
  afterOpenChange,
  ...rest
}: MessageProps) {
  const portalContext = useContext(PortalContext);
  const [resolvedOpen, setResolvedOpen, isControlled] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const [mounted, setMounted] = React.useState(isOpen);
  const previousOpenRef = React.useRef(isOpen);
  const internalCloseStartedRef = React.useRef(false);

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
      internalCloseStartedRef.current = false;
    }

    if (!previousOpenRef.current && isOpen) {
      onOpenChange?.(true);
      afterOpenChange?.(true);
    }

    previousOpenRef.current = isOpen;
  }, [afterOpenChange, isOpen, onOpenChange]);

  const handleCloseStart = React.useCallback(() => {
    if (isControlled || internalCloseStartedRef.current || !isOpen) {
      return;
    }

    internalCloseStartedRef.current = true;
    onCancel?.();
    onOpenChange?.(false);
    setResolvedOpen(false);
  }, [isControlled, isOpen, onCancel, onOpenChange, setResolvedOpen]);

  const handleExited = React.useCallback(() => {
    setMounted(false);
    afterOpenChange?.(false);
  }, [afterOpenChange]);

  if (!isOpen && !mounted) {
    return null;
  }

  const content = (
    <MessageBody
      {...rest}
      isOpen={isOpen}
      onCloseStart={handleCloseStart}
      onExited={handleExited}
    />
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}

export function useMessage(): MessageController {
  const emitter = useOverlayEmitter<MessageShowOptions>({
    render: (options, params) => {
      const { onCancel, ...restOptions } = options;

      return (
        resolvePortalMount(
          <MessageBody
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
    () => ({ show: emitter.show, hide: emitter.hide, clear: emitter.clear }),
    [emitter.clear, emitter.hide, emitter.show],
  );
}
