import React from 'react';
import { View } from 'react-native';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
import type { ResultProps } from './types';
import {
  SIZE_STYLE_MAP,
  STATUS_CONFIG_MAP,
  useStyles,
} from './style';

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
    ? (
      <Icon
        color={statusConfig.iconColor}
        icon={statusConfig.iconName}
        size={sizeConfig.iconSize}
      />
    )
    : icon;
  const resolvedTitle = title === undefined ? titleText : title;
  const resolvedSubtitle = subtitle === undefined ? subtitleText : subtitle;
  const hasIcon = hasRenderableContent(resolvedIcon);

  return (
    <Column
      align="center"
      justify="center"
      style={[tokenStyles.root, style]}
    >
      {hasIcon ? (
        <View style={[tokenStyles.iconContainer, styles?.iconContainer]}>
          {resolvedIcon}
        </View>
      ) : null}
      {renderTextNode(resolvedTitle, (text) => (
        <Text
          size={sizeConfig.titleSize}
          weight="semibold"
          color="heading"
          style={[
            tokenStyles.title,
            hasIcon ? undefined : tokenStyles.titleWithoutIcon,
            styles?.titleText,
          ]}
        >
          {text}
        </Text>
      ))}
      {renderTextNode(resolvedSubtitle, (text) => (
        <Text
          size={sizeConfig.subtitleSize}
          color="secondary"
          style={[tokenStyles.subtitle, styles?.subtitleText]}
        >
          {text}
        </Text>
      ))}
      {extra !== undefined && extra !== null ? (
        <View style={[tokenStyles.extra, styles?.extra]}>{extra}</View>
      ) : null}
    </Column>
  );
}
