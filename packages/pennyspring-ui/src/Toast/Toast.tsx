import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
import React, { useContext } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useTheme } from '@pennyspring/theme';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useOverlayEmitter } from '../_hooks/useOverlayEmitter';
import type {
  ToastController,
  ToastPlacement,
  ToastProps,
  ToastShowOptions,
  ToastStatus,
} from './types';
import { SIZE_TOKEN_MAP, useStyles } from './style';

const DEFAULT_DURATION = 1800;
const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_PLACEMENT: ToastPlacement = 'bottom';
const DEFAULT_STATUS: ToastStatus = 'default';
/** 最大宽 = 屏宽 - 左右各 24 的留白。 */
const MAX_WIDTH_INSET = 48;

interface ToastBodyProps extends ToastShowOptions {
  isOpen: boolean;
  onExited?: () => void;
}

function ToastBody({
  duration,
  icon,
  isOpen,
  message,
  messageText,
  onExited,
  placement = DEFAULT_PLACEMENT,
  size = DEFAULT_SIZE,
  status = DEFAULT_STATUS,
  style,
  styles,
}: ToastBodyProps) {
  const { width } = useWindowDimensions();
  const insets = React.useContext(SafeAreaInsetsContext);
  const tokenStyles = useStyles({
    maxWidth: width - MAX_WIDTH_INSET,
    placement,
    safeAreaBottom: insets?.bottom ?? 0,
    safeAreaTop: insets?.top ?? 0,
    size,
  });
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
  }, [
    handleClosed,
    isOpen,
    progress,
    token.motionDurationMid,
    token.motionEaseInOut,
  ]);

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
  }, [
    duration,
    handleClosed,
    isOpen,
    progress,
    token.motionDurationMid,
    token.motionEaseInOut,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const hiddenOffset =
      contentHeight > 0 ? contentHeight : token.controlHeight;

    return {
      opacity: progress.value,
      transform: [
        ...(placement === 'center' ? [{ translateY: -hiddenOffset }] : []),
        {
          translateY: (1 - progress.value) * hiddenOffset,
        },
      ],
    };
  });

  const hasMessage =
    message !== undefined && message !== null && message !== false;
  const hasText = messageText !== undefined && messageText !== '';

  // 没有文案时不再渲染空胶囊。
  if (!hasMessage && !hasText) {
    return null;
  }

  const sizeConfig = SIZE_TOKEN_MAP[size];
  const resolvedIcon =
    icon === undefined ? (
      status === 'default' ? (
        <View style={tokenStyles.dot} />
      ) : (
        <Icon
          color="lightSolid"
          icon={status === 'success' ? 'check' : 'warning'}
          size={sizeConfig.iconSize}
        />
      )
    ) : (
      icon
    );

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={event => {
        const nextHeight = event.nativeEvent.layout.height;
        setContentHeight(nextHeight);
      }}
      style={[tokenStyles.content, style, styles?.content, animatedStyle]}
    >
      <Row style={tokenStyles.row}>
        {resolvedIcon}
        {renderTextNode(message ?? messageText, text => (
          <Text
            numberOfLines={1}
            size={sizeConfig.textSize}
            style={[tokenStyles.messageText, styles?.messageText]}
          >
            {text}
          </Text>
        ))}
      </Row>
    </Animated.View>
  );
}

export function Toast({
  afterOpenChange,
  defaultOpen,
  duration,
  icon,
  mountPoint = 'auto',
  message,
  messageText,
  onCancel,
  onOpenChange,
  open,
  placement,
  size,
  status,
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
      icon={icon}
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
      status={status}
      style={style}
      styles={styles}
    />
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}

export function useToast(): ToastController {
  const activeKeyRef = React.useRef<number | null>(null);
  const emitter = useOverlayEmitter<ToastShowOptions>({
    render: (options, params) => {
      const { onCancel, ...restOptions } = options;

      return resolvePortalMount(
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
      );
    },
  });

  return React.useMemo(
    () => ({
      show: (options: ToastShowOptions) => {
        // Toast 单实例：新消息直接替换旧消息，不排队、不堆叠。
        if (activeKeyRef.current !== null) {
          emitter.hide(activeKeyRef.current);
        }

        const key = emitter.show(options);
        activeKeyRef.current = key;

        return key;
      },
      hide: (key: number) => {
        if (activeKeyRef.current === key) {
          activeKeyRef.current = null;
        }

        emitter.hide(key);
      },
      clear: () => {
        activeKeyRef.current = null;
        emitter.clear();
      },
    }),
    [emitter],
  );
}
