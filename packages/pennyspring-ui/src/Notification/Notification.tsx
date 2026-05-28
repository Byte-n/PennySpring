import type { ComponentSize } from '../shares/types';
import React, { useContext } from 'react';
import { useWindowDimensions } from 'react-native';
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
  NotificationController,
  NotificationPlacement,
  NotificationProps,
  NotificationShowOptions,
  NotificationType,
} from './types';

const DEFAULT_DURATION = 3200;
const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_TYPE: NotificationType = 'default';
const DEFAULT_PLACEMENT: NotificationPlacement = 'top-left';
const SIZE_MAP: Record<
  ComponentSize,
  {
    descriptionTextSize: 'sm' | 'md' | 'lg';
    gap: (token: ReturnType<typeof useTheme>['token']) => number;
    horizontalPadding: (token: ReturnType<typeof useTheme>['token']) => number;
    titleTextSize: 'md' | 'lg' | 'xl';
    verticalPadding: (token: ReturnType<typeof useTheme>['token']) => number;
  }
> = {
  small: {
    descriptionTextSize: 'sm',
    gap: token => token.marginXXS,
    horizontalPadding: token => token.paddingSM,
    titleTextSize: 'md',
    verticalPadding: token => token.paddingSM / 2,
  },
  normal: {
    descriptionTextSize: 'md',
    gap: token => token.marginXS,
    horizontalPadding: token => token.padding,
    titleTextSize: 'lg',
    verticalPadding: token => token.padding / 2,
  },
  large: {
    descriptionTextSize: 'lg',
    gap: token => token.marginSM,
    horizontalPadding: token => token.paddingMD,
    titleTextSize: 'xl',
    verticalPadding: token => token.paddingMD / 2,
  },
};

function resolveTypeBgColor(
  token: ReturnType<typeof useTheme>['token'],
  type: NotificationType,
): string {
  if (type === 'success') return token.colorSuccessBg;
  if (type === 'warning') return token.colorWarningBg;
  if (type === 'error') return token.colorErrorBg;
  if (type === 'info') return token.colorInfoBg;
  return token.colorBgElevated;
}

function resolveOverlayPlacementStyle(
  placement: NotificationPlacement,
  token: ReturnType<typeof useTheme>['token'],
): {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
} {
  if (placement === 'top-right') {
    return { top: token.paddingMD, right: token.paddingXXS };
  }

  if (placement === 'bottom-left') {
    return { bottom: token.paddingMD, left: token.paddingXXS };
  }

  if (placement === 'bottom-right') {
    return { bottom: token.paddingMD, right: token.paddingXXS };
  }

  return { top: token.paddingMD, left: token.paddingXXS };
}

const useStyles = createUseSheetStyle(
  (
    token,
    {
      maxContentWidth,
      placement,
      size,
      type,
    }: {
      maxContentWidth: number;
      placement: NotificationPlacement;
      size: ComponentSize;
      type: NotificationType;
    },
  ) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      content: {
        position: 'absolute',
        zIndex: token.zIndexPopupBase,
        ...resolveOverlayPlacementStyle(placement, token),
        maxWidth: maxContentWidth,
        backgroundColor: resolveTypeBgColor(token, type),
        borderRadius: token.borderRadiusLG,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorderSecondary,
        paddingVertical: sizeConfig.verticalPadding(token),
        paddingHorizontal: sizeConfig.horizontalPadding(token),
        gap: sizeConfig.gap(token),
      },
      titleText: {
      },
      descriptionText: {
      },
    };
  },
);

interface NotificationBodyProps extends NotificationShowOptions {
  isOpen: boolean;
  onCloseStart?: () => void;
  onExited?: () => void;
}

function NotificationBody({
  description,
  descriptionText,
  duration,
  isOpen,
  onCloseStart,
  onExited,
  placement = DEFAULT_PLACEMENT,
  size = DEFAULT_SIZE,
  style,
  styles,
  title,
  titleText,
  type = DEFAULT_TYPE,
}: NotificationBodyProps) {
  const { token } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const maxContentWidth = Math.max(0, windowWidth - token.paddingLG * 2);
  const tokenStyles = useStyles({ maxContentWidth, placement, size, type });
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
  }, [
    handleClosed,
    isOpen,
    progress,
    token.motionDurationMid,
    token.motionEaseInOut,
  ]);

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
  }, [
    duration,
    handleClosed,
    progress,
    token.motionDurationMid,
    token.motionEaseInOut,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: -((1 - progress.value) * token.controlHeight) }],
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
      {title ?? (
        <Text
          color="heading"
          size={SIZE_MAP[size].titleTextSize}
          weight="strong"
          style={[tokenStyles.titleText, styles?.titleText]}
        >
          {titleText}
        </Text>
      )}
      {description ?? (
        <Text
          color="secondary"
          size={SIZE_MAP[size].descriptionTextSize}
          style={[tokenStyles.descriptionText, styles?.descriptionText]}
        >
          {descriptionText}
        </Text>
      )}
    </Animated.View>
  );
}

export function Notification({
  defaultOpen,
  mountPoint = 'auto',
  onCancel,
  open,
  onOpenChange,
  afterOpenChange,
  ...rest
}: NotificationProps) {
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
    if (internalCloseStartedRef.current || !isOpen) {
      return;
    }

    internalCloseStartedRef.current = true;
    onCancel?.();
    onOpenChange?.(false);

    if (!isControlled) {
      setResolvedOpen(false);
    }
  }, [isControlled, isOpen, onCancel, onOpenChange, setResolvedOpen]);

  const handleExited = React.useCallback(() => {
    setMounted(false);
    afterOpenChange?.(false);
  }, [afterOpenChange]);

  if (!isOpen && !mounted) {
    return null;
  }

  const content = (
    <NotificationBody
      {...rest}
      isOpen={isOpen}
      onCloseStart={handleCloseStart}
      onExited={handleExited}
    />
  );

  return resolvePortalMount(content, mountPoint, portalContext !== null);
}

export function useNotification(): NotificationController {
  const emitter = useOverlayEmitter<NotificationShowOptions>({
    render: (options, params) => {
      const { onCancel, ...restOptions } = options;

      return (
        resolvePortalMount(
          <NotificationBody
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
