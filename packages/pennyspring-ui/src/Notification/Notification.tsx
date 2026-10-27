import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
import React, { useContext } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
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
  NotificationController,
  NotificationPlacement,
  NotificationProps,
  NotificationShowOptions,
  NotificationType,
} from './types';

const DEFAULT_DURATION = 3200;
const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_TYPE: NotificationType = 'default';
const DEFAULT_PLACEMENT: NotificationPlacement = 'top';
const CLOSE_SIZE = 24;
const CLOSE_ICON_SIZE = 14;
/** 进出位移固定 12（sizeSM），不再用 controlHeight。 */
const ENTER_OFFSET = 12;
const MAX_ACTIONS = 2;

interface SizeConfig {
  gap: (token: AliasToken) => number;
  descriptionTextSize: 'xs' | 'sm';
  iconSize: number;
  padding: (token: AliasToken) => number;
  plateRadius: number;
  plateSize: number;
  titleTextSize: 'xs' | 'sm' | 'md';
}

/** 底板 26 / 32 / 38 与圆角 7 / 8 / 10 在 AliasToken 中没有档位，落为语义常量。 */
const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    gap: token => token.marginXS,
    descriptionTextSize: 'xs',
    iconSize: 15,
    padding: token => token.paddingSM,
    plateRadius: 7,
    plateSize: 26,
    titleTextSize: 'xs',
  },
  normal: {
    gap: token => token.marginXS,
    descriptionTextSize: 'sm',
    iconSize: 18,
    padding: token => token.padding,
    plateRadius: 8,
    plateSize: 32,
    titleTextSize: 'sm',
  },
  large: {
    gap: token => token.marginXS,
    descriptionTextSize: 'sm',
    iconSize: 20,
    padding: token => token.padding,
    plateRadius: 10,
    plateSize: 38,
    titleTextSize: 'md',
  },
};

interface TypeConfig {
  actionColor: TextColor;
  icon: IconName;
  iconColor: IconColor;
  plateColor: (token: AliasToken) => string;
}

const TYPE_STYLE_MAP: Record<NotificationType, TypeConfig> = {
  default: {
    actionColor: 'primaryText',
    icon: 'info',
    iconColor: 'textSecondary',
    plateColor: token => token.colorFillTertiary,
  },
  success: {
    actionColor: 'successText',
    icon: 'check-circle',
    iconColor: 'success',
    plateColor: token => token.colorSuccessBg,
  },
  warning: {
    actionColor: 'warningText',
    icon: 'warning',
    iconColor: 'warning',
    plateColor: token => token.colorWarningBg,
  },
  error: {
    actionColor: 'errorText',
    icon: 'close-circle',
    iconColor: 'error',
    plateColor: token => token.colorErrorBg,
  },
  info: {
    actionColor: 'primaryText',
    icon: 'info',
    iconColor: 'info',
    plateColor: token => token.colorInfoBg,
  },
};

interface NotificationStyleOptions {
  maxContentWidth: number;
  placement: NotificationPlacement;
  safeAreaBottom: number;
  safeAreaTop: number;
  size: ComponentSize;
  type: NotificationType;
}

const useStyles = createUseSheetStyle(
  (
    token,
    { maxContentWidth, placement, safeAreaBottom, safeAreaTop, size, type }: NotificationStyleOptions,
  ) => {
    const sizeConfig = SIZE_MAP[size];
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
        maxWidth: maxContentWidth,
        alignSelf: 'center',
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        padding: sizeConfig.padding(token),
        ...toShadowStyle(token.boxShadowSecondary),
      },
      body: {
        alignItems: 'flex-start',
        gap: token.marginXS,
        width: '100%',
      },
      plate: {
        alignItems: 'center',
        backgroundColor: typeConfig.plateColor(token),
        borderRadius: sizeConfig.plateRadius,
        height: sizeConfig.plateSize,
        justifyContent: 'center',
        width: sizeConfig.plateSize,
      },
      main: {
        flex: 1,
      },
      titleText: {
        color: token.colorText,
      },
      descriptionText: {
        marginTop: token.marginXXS / 2,
      },
      actions: {
        flexDirection: 'row',
        gap: token.marginSM,
        marginTop: token.marginXS,
      },
      actionText: {
        color: token.colorPrimaryText,
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

interface NotificationBodyProps extends NotificationShowOptions {
  isOpen: boolean;
  onCloseStart?: () => void;
  onExited?: () => void;
}

function NotificationBody({
  actions,
  closable = true,
  description,
  descriptionText,
  duration,
  icon,
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
  const insets = React.useContext(SafeAreaInsetsContext);
  const tokenStyles = useStyles({
    maxContentWidth: Math.max(0, windowWidth - token.padding * 2),
    placement,
    safeAreaBottom: insets?.bottom ?? 0,
    safeAreaTop: insets?.top ?? 0,
    size,
    type,
  });
  const progress = useSharedValue(0);
  const closedRef = React.useRef(false);
  const sizeConfig = SIZE_MAP[size];
  const typeConfig = TYPE_STYLE_MAP[type];
  const visibleActions = actions?.slice(0, MAX_ACTIONS) ?? [];
  const hasTitle = title !== undefined || titleText !== undefined;
  const hasDescription = description !== undefined || descriptionText !== undefined;

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
    // 有操作时常驻，等用户点操作或关闭；显式 duration 仍然生效。
    if (duration === 0 || (visibleActions.length > 0 && duration === undefined)) {
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
    onCloseStart,
    progress,
    token.motionDurationMid,
    token.motionEaseInOut,
    visibleActions.length,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const distance = (1 - progress.value) * ENTER_OFFSET;

    return {
      opacity: progress.value,
      transform: [{ translateY: placement === 'top' ? -distance : distance }],
    };
  });

  // 标题与说明都为空时不渲染空卡片。
  if (!hasTitle && !hasDescription) {
    return null;
  }

  const resolvedIcon = icon === null
    ? null
    : icon ?? (
      <Icon color={typeConfig.iconColor} icon={typeConfig.icon} size={sizeConfig.iconSize} />
    );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[tokenStyles.content, style, styles?.content, animatedStyle]}
    >
      <Row style={tokenStyles.body}>
        {icon === null ? null : (
          <View style={tokenStyles.plate}>{resolvedIcon}</View>
        )}
        <View style={tokenStyles.main}>
          {renderTextNode(title ?? titleText, (text) => (
            <Text
              color="default"
              size={sizeConfig.titleTextSize}
              style={[tokenStyles.titleText, styles?.titleText]}
              weight="semibold"
            >
              {text}
            </Text>
          ))}
          {renderTextNode(description ?? descriptionText, (text) => (
            <Text
              color="secondary"
              numberOfLines={2}
              size={sizeConfig.descriptionTextSize}
              style={[tokenStyles.descriptionText, styles?.descriptionText]}
            >
              {text}
            </Text>
          ))}
          {visibleActions.length > 0 ? (
            <Row style={tokenStyles.actions}>
              {visibleActions.map(action => (
                <Text
                  key={action.text}
                  color={typeConfig.actionColor}
                  onPress={action.onPress}
                  size="sm"
                  weight="semibold"
                >
                  {action.text}
                </Text>
              ))}
            </Row>
          ) : null}
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
