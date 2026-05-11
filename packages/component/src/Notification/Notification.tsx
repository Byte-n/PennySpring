import React, { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle, toShadowStyle, useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Portal } from '../Portal';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { AliasToken } from '@pennyspring/theme';
import type { DimensionValue, StyleProp, TextStyle } from 'react-native';
import type { IconName } from '../Icon/types';
import type {
  NotificationProps,
  NotificationSize,
  NotificationType,
} from './types';

interface NotificationStyleOptions {
  size: NotificationSize;
  type: NotificationType;
}

interface SizeConfig {
  padding: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  borderRadius: (token: AliasToken) => number;
  titleFontSize: (token: AliasToken) => number;
  titleLineHeight: (token: AliasToken) => number;
  contentFontSize: (token: AliasToken) => number;
  contentLineHeight: (token: AliasToken) => number;
  descriptionFontSize: (token: AliasToken) => number;
  descriptionLineHeight: (token: AliasToken) => number;
  iconSize: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  maxWidth: DimensionValue;
}

const SIZE_CONFIG_MAP: Record<NotificationSize, SizeConfig> = {
  small: {
    padding: token => token.paddingSM,
    paddingVertical: token => token.paddingXS,
    borderRadius: token => token.borderRadius,
    titleFontSize: token => token.fontSize,
    titleLineHeight: token => token.lineHeight,
    contentFontSize: token => token.fontSizeSM,
    contentLineHeight: token => token.lineHeightSM,
    descriptionFontSize: token => token.fontSizeSM,
    descriptionLineHeight: token => token.lineHeightSM,
    iconSize: token => token.fontSizeLG,
    gap: token => token.marginXS,
    maxWidth: '88%',
  },
  normal: {
    padding: token => token.padding,
    paddingVertical: token => token.paddingSM,
    borderRadius: token => token.borderRadiusLG,
    titleFontSize: token => token.fontSizeLG,
    titleLineHeight: token => token.lineHeightLG,
    contentFontSize: token => token.fontSize,
    contentLineHeight: token => token.lineHeight,
    descriptionFontSize: token => token.fontSizeSM,
    descriptionLineHeight: token => token.lineHeightSM,
    iconSize: token => token.fontSizeXL,
    gap: token => token.marginSM,
    maxWidth: '88%',
  },
  large: {
    padding: token => token.paddingLG,
    paddingVertical: token => token.padding,
    borderRadius: token => token.borderRadiusLG,
    titleFontSize: token => token.fontSizeXL,
    titleLineHeight: token => token.lineHeightXL,
    contentFontSize: token => token.fontSizeLG,
    contentLineHeight: token => token.lineHeightLG,
    descriptionFontSize: token => token.fontSize,
    descriptionLineHeight: token => token.lineHeight,
    iconSize: token => token.fontSizeHeading4,
    gap: token => token.marginSM,
    maxWidth: '88%',
  },
};

function resolveTypeColor(token: AliasToken, type: NotificationType): string {
  if (type === 'success') {
    return token.colorSuccess;
  }

  if (type === 'warning') {
    return token.colorWarning;
  }

  if (type === 'error') {
    return token.colorError;
  }

  return token.colorInfo;
}

function resolveDefaultIconName(type: NotificationType): IconName {
  if (type === 'success') {
    return 'check-circle';
  }

  if (type === 'warning') {
    return 'warning';
  }

  if (type === 'error') {
    return 'close-circle';
  }

  return 'info';
}

const useStyles = createUseSheetStyle(
  (token, { size, type }: NotificationStyleOptions) => {
    const sizeConfig = SIZE_CONFIG_MAP[size];
    const typeColor = resolveTypeColor(token, type);

    return {
      container: {
        position: 'absolute',
        top: token.paddingXL,
        left: token.padding,
        right: token.padding,
        maxWidth: sizeConfig.maxWidth,
        alignSelf: 'center',
        zIndex: token.zIndexPopupBase + token.zIndexBase + 100,
        backgroundColor: token.colorBgElevated,
        borderRadius: sizeConfig.borderRadius(token),
        paddingHorizontal: sizeConfig.padding(token),
        paddingVertical: sizeConfig.paddingVertical(token),
        ...toShadowStyle(token.boxShadow),
      },
      icon: {
        marginRight: sizeConfig.gap(token),
      },
      header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
      titleText: {
        color: token.colorTextHeading,
        fontSize: sizeConfig.titleFontSize(token),
        lineHeight: sizeConfig.titleLineHeight(token),
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
        flex: 1,
      },
      body: {
        marginTop: sizeConfig.gap(token),
      },
      contentText: {
        color: token.colorText,
        fontSize: sizeConfig.contentFontSize(token),
        lineHeight: sizeConfig.contentLineHeight(token),
      },
      descriptionText: {
        color: token.colorTextDescription,
        fontSize: sizeConfig.descriptionFontSize(token),
        lineHeight: sizeConfig.descriptionLineHeight(token),
        marginTop: token.marginXXS,
      },
      closeButton: {
        marginLeft: sizeConfig.gap(token),
        padding: token.paddingXXS,
      },
      typeIndicator: {
        width: token.lineWidthBold,
        borderRadius: token.lineWidthBold,
        backgroundColor: typeColor,
        marginRight: sizeConfig.gap(token),
        alignSelf: 'stretch',
      },
    };
  },
);

function renderTitle(
  title: NotificationProps['title'],
  titleText: NotificationProps['titleText'],
  style: StyleProp<TextStyle>,
) {
  if (title !== undefined && title !== null) {
    return title;
  }

  if (titleText === undefined) {
    return null;
  }

  return (
    <Text style={style} testID="notification-title-text">
      {titleText}
    </Text>
  );
}

function renderContent(
  content: NotificationProps['content'],
  contentText: NotificationProps['contentText'],
  style: StyleProp<TextStyle>,
) {
  if (content !== undefined && content !== null) {
    return content;
  }

  if (contentText === undefined) {
    return null;
  }

  return (
    <Text style={style} testID="notification-content-text">
      {contentText}
    </Text>
  );
}

function renderDescription(
  description: NotificationProps['description'],
  descriptionText: NotificationProps['descriptionText'],
  style: StyleProp<TextStyle>,
) {
  if (description !== undefined && description !== null) {
    return description;
  }

  if (descriptionText === undefined) {
    return null;
  }

  return (
    <Text style={style} testID="notification-description-text">
      {descriptionText}
    </Text>
  );
}

const DEFAULT_DURATION = 4500;

export function Notification({
  closeable = false,
  content,
  contentText,
  defaultOpen,
  description,
  descriptionText,
  duration = DEFAULT_DURATION,
  icon,
  onCancel,
  onPress,
  onOpenChange,
  open,
  size = 'normal',
  style,
  styles: slotStyles,
  title,
  titleText,
  type = 'info',
}: NotificationProps) {
  const { token } = useTheme();
  const tokenStyles = useStyles({ size, type });
  const [isOpen, handleChange, isControlled] = useControllableValue(defaultOpen, open, onOpenChange);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCancelRef = useRef(onCancel);

  // Keep ref in sync
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!isOpen || duration <= 0) {
      return;
    }

    timerRef.current = setTimeout(() => {
      onCancelRef.current?.();
      handleChange(false);
    }, duration);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, duration, isControlled, handleChange]);

  const handleClosePress = (): void => {
    onCancelRef.current?.();
    handleChange(false);
  };

  const handleBodyPress = (): void => {
    onPress?.();
  };

  if (!isOpen) {
    return null;
  }

  const titleNode = renderTitle(title, titleText, [
    tokenStyles.titleText,
    slotStyles?.titleText,
  ]);

  const contentNode = renderContent(content, contentText, [
    tokenStyles.contentText,
    slotStyles?.contentText,
  ]);

  const descriptionNode = renderDescription(description, descriptionText, [
    tokenStyles.descriptionText,
    slotStyles?.descriptionText,
  ]);

  const hasBody = contentNode !== null || descriptionNode !== null;

  return (
    <Portal>
      <View
        style={[tokenStyles.container, style]}
        testID="notification-container"
      >
        <Pressable
          onPress={handleBodyPress}
          testID="notification-body"
        >
          <View style={[tokenStyles.header, slotStyles?.header]}>
            <View style={tokenStyles.typeIndicator} />
            {icon !== undefined && icon !== null ? (
              <View style={[tokenStyles.icon, slotStyles?.icon]}>{icon}</View>
            ) : (
              <View style={[tokenStyles.icon, slotStyles?.icon]}>
                <Icon
                  icon={resolveDefaultIconName(type)}
                  size={SIZE_CONFIG_MAP[size].iconSize(token)}
                  color={resolveTypeColor(token, type)}
                />
              </View>
            )}
            {titleNode}
            {closeable ? (
              <Pressable
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={handleClosePress}
                style={[tokenStyles.closeButton, slotStyles?.closeButton]}
                testID="notification-close-button"
              >
                <Icon icon="close" size="small" />
              </Pressable>
            ) : null}
          </View>
          {hasBody ? (
            <View style={tokenStyles.body}>
              {contentNode}
              {descriptionNode}
            </View>
          ) : null}
        </Pressable>
      </View>
    </Portal>
  );
}
