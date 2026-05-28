import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { ResultStatus } from '../types';
import type { IconColor, IconName } from '../../Icon';
import type { TextSize } from '../../Text';

export interface ResultStyleOptions {
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

export const RESULT_LARGE_ICON_SCALE = 1.25;

export const SIZE_STYLE_MAP: Record<ComponentSize, ResultSizeConfig> = {
  small: {
    gap: token => token.marginXXS,
    paddingVertical: token => token.paddingSM / 2,
    titleSize: 'md',
    subtitleSize: 'sm',
    iconContainerSize: token => token.sizeXL,
    iconBorderRadius: token => token.sizeXL / 2,
  },
  normal: {
    gap: token => token.marginXS,
    paddingVertical: token => token.paddingMD / 2,
    titleSize: 'lg',
    subtitleSize: 'md',
    iconContainerSize: token => token.sizeXXL,
    iconBorderRadius: token => token.sizeXXL / 2,
  },
  large: {
    gap: token => token.marginSM,
    paddingVertical: token => token.paddingLG / 2,
    titleSize: 'xl',
    subtitleSize: 'lg',
    iconContainerSize: token => token.sizeXXL * RESULT_LARGE_ICON_SCALE,
    iconBorderRadius: token => (token.sizeXXL * RESULT_LARGE_ICON_SCALE) / 2,
  },
};

export const STATUS_CONFIG_MAP: Record<ResultStatus, ResultStatusConfig> = {
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

export const useStyles = createUseSheetStyle(
  (token, { size, status }: ResultStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const statusConfig = STATUS_CONFIG_MAP[status];

    return {
      root: {
        gap: sizeConfig.gap(token),
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
        textAlign: 'center',
      },
      subtitle: {
        textAlign: 'center',
      },
      extra: {
        alignItems: 'center',
        marginTop: token.marginXS,
      },
    };
  },
);
