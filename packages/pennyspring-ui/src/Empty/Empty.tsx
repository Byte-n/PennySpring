import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
import React from 'react';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { EmptyProps } from './types';
import type { TextSize } from '../Text';
import { EmptyIcon } from 'phosphor-react-native';

interface EmptyStyleOptions {
  size: ComponentSize;
}

interface EmptySizeConfig {
  iconSize: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  messageSize: TextSize;
}

const SIZE_STYLE_MAP: Record<ComponentSize, EmptySizeConfig> = {
  small: {
    iconSize: token => token.fontSizeXL,
    gap: token => token.marginXXS,
    paddingVertical: token => token.paddingSM / 2,
    messageSize: 'sm',
  },
  normal: {
    iconSize: token => token.fontSizeHeading4,
    gap: token => token.marginXS,
    paddingVertical: token => token.paddingMD / 2,
    messageSize: 'md',
  },
  large: {
    iconSize: token => token.fontSizeHeading3,
    gap: token => token.marginSM,
    paddingVertical: token => token.paddingLG / 2,
    messageSize: 'lg',
  },
};

const DEFAULT_MESSAGE_TEXT = '暂无内容';

const useStyles = createUseSheetStyle((token, { size }: EmptyStyleOptions) => {
  const sizeConfig = SIZE_STYLE_MAP[size];

  return {
    root: {
      gap: sizeConfig.gap(token),
      paddingVertical: sizeConfig.paddingVertical(token),
      width: '100%',
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: {
      color: token.colorTextSecondary,
      textAlign: 'center',
    },
  };
});

function hasRenderableContent(content: React.ReactNode): boolean {
  return content !== null && content !== undefined && content !== false;
}

export function Empty({
  icon,
  message,
  messageText,
  size = 'normal',
  style,
  styles,
}: EmptyProps) {
  const tokenStyles = useStyles({ size });
  const sizeConfig = SIZE_STYLE_MAP[size];
  const resolvedIcon = icon === undefined
    ? <Icon icon={EmptyIcon} size={size} color="textQuaternary" />
    : icon;
  const resolvedMessage = message === undefined
    ? messageText ?? DEFAULT_MESSAGE_TEXT
    : message;

  return (
    <Column
      align="center"
      justify="center"
      style={[tokenStyles.root, style]}
    >
      {hasRenderableContent(resolvedIcon) ? (
        <Column
          align="center"
          justify="center"
          style={[tokenStyles.iconContainer, styles?.iconContainer]}
        >
          {resolvedIcon}
        </Column>
      ) : null}
      {renderTextNode(resolvedMessage, (text) => (
        <Text
          size={sizeConfig.messageSize}
          color="secondary"
          style={[tokenStyles.message, styles?.message]}
        >
          {text}
        </Text>
      ))}
    </Column>
  );
}
