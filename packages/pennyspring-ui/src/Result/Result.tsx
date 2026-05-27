import type { ComponentSize } from '../shares/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { IconColor, IconName } from '../Icon';
import type { TextSize } from '../Text';
import type { ResultProps,
  ResultStatus,
} from './types';

interface ResultStyleOptions {
  size: ComponentSize;
  status: ResultStatus;
}

interface ResultSizeConfig {
  gap: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  titleSize: TextSize;
  subtitleSize: TextSize;
  iconContainerSize: (token: AliasToken) => number;
  iconBorderRadius: (token: AliasToken) => number;
}

interface ResultStatusConfig {
  iconBg: (token: AliasToken) => string;
  iconColor: IconColor;
  iconName: IconName;
}

const SIZE_STYLE_MAP: Record<ComponentSize, ResultSizeConfig> = {
  small: {
    gap: token => token.marginXS,
    paddingVertical: token => token.paddingSM / 2,
    titleSize: 'md',
    subtitleSize: 'sm',
    iconContainerSize: token => token.sizeXL,
    iconBorderRadius: token => token.sizeXL / 2,
  },
  normal: {
    gap: token => token.marginSM,
    paddingVertical: token => token.paddingMD / 2,
    titleSize: 'lg',
    subtitleSize: 'md',
    iconContainerSize: token => token.sizeXXL,
    iconBorderRadius: token => token.sizeXXL / 2,
  },
  large: {
    gap: token => token.marginMD,
    paddingVertical: token => token.paddingLG / 2,
    titleSize: 'xl',
    subtitleSize: 'lg',
    iconContainerSize: token => token.sizeXXL * 1.25,
    iconBorderRadius: token => (token.sizeXXL * 1.25) / 2,
  },
};

const STATUS_CONFIG_MAP: Record<ResultStatus, ResultStatusConfig> = {
  success: {
    iconBg: token => token.colorSuccessBg,
    iconColor: 'success',
    iconName: 'check-circle',
  },
  warning: {
    iconBg: token => token.colorWarningBg,
    iconColor: 'warning',
    iconName: 'warning',
  },
  error: {
    iconBg: token => token.colorErrorBg,
    iconColor: 'error',
    iconName: 'close-circle',
  },
  info: {
    iconBg: token => token.colorInfoBg,
    iconColor: 'info',
    iconName: 'info',
  },
};

const useStyles = createUseSheetStyle(
  (token, { size, status }: ResultStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const statusConfig = STATUS_CONFIG_MAP[status];

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
        backgroundColor: statusConfig.iconBg(token),
        borderRadius: sizeConfig.iconBorderRadius(token),
        height: sizeConfig.iconContainerSize(token),
        width: sizeConfig.iconContainerSize(token),
      },
      title: {
        color: token.colorTextHeading,
        textAlign: 'center',
      },
      subtitle: {
        color: token.colorTextSecondary,
        textAlign: 'center',
      },
      extra: {
        alignItems: 'center',
        marginTop: token.marginXS,
      },
    };
  },
);

function isPrimitiveContent(content: React.ReactNode): content is string | number {
  return typeof content === 'string' || typeof content === 'number';
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

  const resolvedTitle = title ?? titleText;
  const resolvedSubtitle = subtitle ?? subtitleText;

  return (
    <View style={[tokenStyles.root, style]}>
      <View style={[tokenStyles.iconContainer, styles?.iconContainer]}>
        {icon ?? (
          <Icon
            icon={statusConfig.iconName}
            size={size}
            color={statusConfig.iconColor}
          />
        )}
      </View>
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
      {extra ? (
        <View style={[tokenStyles.extra, styles?.extra]}>{extra}</View>
      ) : null}
    </View>
  );
}
