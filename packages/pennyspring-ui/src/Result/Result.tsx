import React from 'react';
import { View } from 'react-native';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { ResultProps } from './types';
import {
  SIZE_STYLE_MAP,
  STATUS_CONFIG_MAP,
  useStyles,
} from './style';

function isPrimitiveContent(content: React.ReactNode): content is string | number {
  return typeof content === 'string' || typeof content === 'number';
}

function hasRenderableContent(content: React.ReactNode): boolean {
  return content !== null && content !== undefined && content !== false;
}

export function Result({
  status = 'info',
  size = 'normal',
  icon,
  titleText,
  title,
  subtitleText,
  subtitle,
  extra,
  style,
  styles,
}: ResultProps) {
  const tokenStyles = useStyles({ size, status });
  const sizeConfig = SIZE_STYLE_MAP[size];
  const statusConfig = STATUS_CONFIG_MAP[status];

  const resolvedIcon = icon === undefined
    ? <Icon icon={statusConfig.iconName} size={size} color={statusConfig.iconColor} />
    : icon;
  const resolvedTitle = title === undefined ? titleText : title;
  const resolvedSubtitle = subtitle === undefined ? subtitleText : subtitle;

  return (
    <Column
      align="center"
      justify="center"
      style={[tokenStyles.root, style]}
    >
      {hasRenderableContent(resolvedIcon) ? (
        <View style={[tokenStyles.iconContainer, styles?.iconContainer]}>
          {resolvedIcon}
        </View>
      ) : null}
      {isPrimitiveContent(resolvedTitle) ? (
        <Text
          size={sizeConfig.titleSize}
          weight="semibold"
          color="heading"
          style={[tokenStyles.title, styles?.titleText]}
        >
          {resolvedTitle}
        </Text>
      ) : (
        resolvedTitle
      )}
      {isPrimitiveContent(resolvedSubtitle) ? (
        <Text
          size={sizeConfig.subtitleSize}
          color="secondary"
          style={[tokenStyles.subtitle, styles?.subtitleText]}
        >
          {resolvedSubtitle}
        </Text>
      ) : (
        resolvedSubtitle
      )}
      {extra !== undefined && extra !== null ? (
        <View style={[tokenStyles.extra, styles?.extra]}>{extra}</View>
      ) : null}
    </Column>
  );
}
