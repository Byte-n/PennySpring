import { isPrimitiveContent, renderTextNode } from '../shares/node';
import React, { useContext } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { createUseSheetStyle, toShadowStyle, useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useOverlayEmitter } from '../_hooks/useOverlayEmitter';
import type { AliasToken } from '@pennyspring/theme';
import type { IconColor, IconName } from '../Icon';
import type { TextColor } from '../Text';
import type {
  MessageController,
  MessagePlacement,
  MessageProps,
  MessageShowOptions,
  MessageType,
} from './types';

const DEFAULT_DURATION = 2400;
const DEFAULT_TYPE: MessageType = 'default';
const DEFAULT_PLACEMENT: MessagePlacement = 'top';
const ICON_SIZE = 16;
const CLOSE_ICON_SIZE = 14;
const CLOSE_SIZE = 24;
/** 进出位移固定 8，不再用内容高度的一半。 */
const ENTER_OFFSET = 8;

interface TypeStyleConfig {
  actionColor: TextColor;
  backgroundColor: (token: AliasToken) => string;
  iconColor: IconColor;
  icon: IconName;
}

const TYPE_STYLE_MAP: Record<MessageType, TypeStyleConfig> = {
  default: {
    actionColor: 'primaryText',
    backgroundColor: token => token.colorBgContainer,
    iconColor: 'textSecondary',
    icon: 'info',
  },
  success: {
    actionColor: 'successText',
    backgroundColor: token => token.colorSuccessBg,
    iconColor: 'success',
    icon: 'check-circle',
  },
  warning: {
    actionColor: 'warningText',
    backgroundColor: token => token.colorWarningBg,
    iconColor: 'warning',
    icon: 'warning',
  },
  error: {
    actionColor: 'errorText',
    backgroundColor: token => token.colorErrorBg,
    iconColor: 'error',
    icon: 'close-circle',
  },
  info: {
    actionColor: 'primaryText',
    backgroundColor: token => token.colorInfoBg,
    iconColor: 'info',
    icon: 'info',
  },
};

interface MessageStyleOptions {
  placement: MessagePlacement;
  safeAreaBottom: number;
  safeAreaTop: number;
  type: MessageType;
}

const useStyles = createUseSheetStyle(
  (token, { placement, safeAreaBottom, safeAreaTop, type }: MessageStyleOptions) => {
    const typeConfig = TYPE_STYLE_MAP[type];

    return {
      content: {
        position: 'absolute',
        zIndex: token.zIndexPopupBase,
        left: token.padding,
        right: token.padding,
        ...(placement === 'top'
          ? { top: safeAreaTop + token.marginXS }
          : { bottom: safeAreaBottom + token.paddingLG }),
        borderRadius: token.borderRadius,
        backgroundColor: typeConfig.backgroundColor(token),
        paddingHorizontal: token.paddingSM,
        paddingVertical: token.paddingSM,
        ...(type === 'default'
          ? { borderColor: token.colorSplit, borderWidth: token.lineWidth }
          : null),
        ...toShadowStyle(token.boxShadowSecondary),
      },
      body: {
        alignItems: 'flex-start',
        gap: token.marginXS,
        width: '100%',
      },
      icon: {
        marginTop: token.marginXXS / 2,
      },
      bodyContent: {
        flex: 1,
      },
      messageText: {
        color: token.colorText,
        flex: 1,
      },
      action: {
        marginLeft: token.marginXXS,
      },
      close: {
        alignItems: 'center',
        borderRadius: CLOSE_SIZE / 2,
        height: CLOSE_SIZE,
        justifyContent: 'center',
        marginRight: -token.marginXXS,
        marginTop: -token.marginXXS / 2,
        width: CLOSE_SIZE,
      },
    };
  },
);

interface MessageBodyProps extends MessageShowOptions {
  isOpen: boolean;
  onCloseStart?: () => void;
  onExited?: () => void;
}

function MessageBody({
  action,
  closable = true,
  duration,
  icon,
  isOpen,
  message,
  messageText,
  onCloseStart,
  onExited,
  placement = DEFAULT_PLACEMENT,
  style,
  styles,
  type = DEFAULT_TYPE,
}: MessageBodyProps) {
  const insets = React.useContext(SafeAreaInsetsContext);
  const tokenStyles = useStyles({
    placement,
    safeAreaBottom: insets?.bottom ?? 0,
    safeAreaTop: insets?.top ?? 0,
    type,
  });
  const { token } = useTheme();
  const progress = useSharedValue(0);
  const closedRef = React.useRef(false);
  const typeConfig = TYPE_STYLE_MAP[type];

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
    // 有操作时常驻，等用户点操作或关闭；显式 duration 仍然生效。
    if (duration === 0 || (action !== undefined && duration === undefined)) {
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
    action,
    duration,
    handleClosed,
    onCloseStart,
    progress,
    token.motionDurationMid,
    token.motionEaseInOut,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const distance = (1 - progress.value) * ENTER_OFFSET;

    return {
      opacity: progress.value,
      transform: [{ translateY: placement === 'top' ? -distance : distance }],
    };
  });

  const isActionAttachedInline = isPrimitiveContent(message ?? messageText) && action !== undefined;
  const actionNode = action === undefined ? null : (
    <Text
      color={typeConfig.actionColor}
      onPress={action.onPress}
      size="sm"
      style={[tokenStyles.action, styles?.action]}
      weight="semibold"
    >
      {isActionAttachedInline ? `  ${action.text}` : action.text}
    </Text>
  );
  const resolvedIcon = icon === undefined
    ? (
      <Icon
        color={typeConfig.iconColor}
        icon={typeConfig.icon}
        size={ICON_SIZE}
        style={tokenStyles.icon}
      />
    )
    : icon;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[tokenStyles.content, style, styles?.content, animatedStyle]}
    >
      <Row style={tokenStyles.body}>
        {resolvedIcon}
        <View style={tokenStyles.bodyContent}>
          {renderTextNode(message ?? messageText, (text) => (
            <Text
              color="default"
              numberOfLines={2}
              size="sm"
              style={[tokenStyles.messageText, styles?.messageText]}
            >
              {text}
              {isActionAttachedInline ? actionNode : null}
            </Text>
          ))}
          {!isActionAttachedInline ? actionNode : null}
        </View>
        {closable ? (
          <Pressable hitSlop={token.marginXXS} onPress={onCloseStart} style={tokenStyles.close}>
            <Icon color="tertiary" icon="close" size={CLOSE_ICON_SIZE} />
          </Pressable>
        ) : null}
      </Row>
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
