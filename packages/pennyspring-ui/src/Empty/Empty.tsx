import type { ComponentSize } from '../shares/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
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
    gap: token => token.marginXS,
    paddingVertical: token => token.paddingSM / 2,
    messageSize: 'sm',
  },
  normal: {
    iconSize: token => token.fontSizeHeading4,
    gap: token => token.marginSM,
    paddingVertical: token => token.paddingMD / 2,
    messageSize: 'md',
  },
  large: {
    iconSize: token => token.fontSizeHeading3,
    gap: token => token.marginMD,
    paddingVertical: token => token.paddingLG / 2,
    messageSize: 'lg',
  },
};

const DEFAULT_MESSAGE_TEXT = '暂无内容';

const useStyles = createUseSheetStyle((token, { size }: EmptyStyleOptions) => {
  const sizeConfig = SIZE_STYLE_MAP[size];

  return {
    root: {
      alignItems: 'center',
      gap: sizeConfig.gap(token),
      justifyContent: 'center',
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

function isPrimitiveContent(content: React.ReactNode): content is string | number {
  return typeof content === 'string' || typeof content === 'number';
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
  const resolvedMessage = message ?? messageText ?? DEFAULT_MESSAGE_TEXT;

  return (
    <View style={[tokenStyles.root, style]}>
      <View style={[tokenStyles.iconContainer, styles?.iconContainer]}>
        {icon ?? <Icon icon={EmptyIcon} size={size} color="textQuaternary" />}
      </View>
      {isPrimitiveContent(resolvedMessage) ? (
        <Text
          size={sizeConfig.messageSize}
          color="secondary"
          style={[tokenStyles.message, styles?.message]}
        >
          {resolvedMessage}
        </Text>
      ) : (
        resolvedMessage
      )}
    </View>
  );
}
