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
  paddingVertical: (token: AliasToken) => number;
  titleMarginTop: (token: AliasToken) => number;
  subtitleMarginTop: (token: AliasToken) => number;
  extraMarginTop: (token: AliasToken) => number;
  titleSize: TextSize;
  subtitleSize: TextSize;
  iconContainerSize: number;
  iconSize: number;
}

interface ResultStatusConfig {
  iconBg: (token: AliasToken) => string;
  iconColor: IconColor;
  iconName: IconName;
}

/** AliasToken 没有结果图标档位；40 / 48 / 56 为语义常量。 */
const RESULT_ICON_SMALL = 40;
const RESULT_ICON_NORMAL = 48;
const RESULT_ICON_LARGE = 56;
const RESULT_ICON_INSET_SMALL = 20;
const RESULT_ICON_INSET_NORMAL = 24;
const RESULT_ICON_INSET_LARGE = 28;
const SUBTITLE_MAX_WIDTH = 320;
const PILL_RADIUS = 999;

export const SIZE_STYLE_MAP: Record<ComponentSize, ResultSizeConfig> = {
  small: {
    paddingVertical: token => token.paddingSM,
    titleMarginTop: token => token.marginXS,
    subtitleMarginTop: token => token.marginXXS / 2,
    extraMarginTop: token => token.marginXS,
    titleSize: 'md',
    subtitleSize: 'xs',
    iconContainerSize: RESULT_ICON_SMALL,
    iconSize: RESULT_ICON_INSET_SMALL,
  },
  normal: {
    paddingVertical: token => token.padding,
    titleMarginTop: token => token.marginSM,
    subtitleMarginTop: token => token.marginXXS,
    extraMarginTop: token => token.marginSM,
    titleSize: 'lg',
    subtitleSize: 'sm',
    iconContainerSize: RESULT_ICON_NORMAL,
    iconSize: RESULT_ICON_INSET_NORMAL,
  },
  large: {
    paddingVertical: token => token.paddingLG,
    titleMarginTop: token => token.padding,
    subtitleMarginTop: token => token.marginXXS,
    extraMarginTop: token => token.padding,
    titleSize: 'xl',
    subtitleSize: 'sm',
    iconContainerSize: RESULT_ICON_LARGE,
    iconSize: RESULT_ICON_INSET_LARGE,
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
        alignItems: 'center',
        paddingVertical: sizeConfig.paddingVertical(token),
        width: '100%',
      },
      iconContainer: {
        alignItems: 'center',
        backgroundColor: statusConfig.iconBg(token),
        borderRadius: PILL_RADIUS,
        height: sizeConfig.iconContainerSize,
        justifyContent: 'center',
        width: sizeConfig.iconContainerSize,
      },
      title: {
        marginTop: sizeConfig.titleMarginTop(token),
        textAlign: 'center' as const,
      },
      titleWithoutIcon: {
        marginTop: 0,
      },
      subtitle: {
        marginTop: sizeConfig.subtitleMarginTop(token),
        maxWidth: SUBTITLE_MAX_WIDTH,
        textAlign: 'center' as const,
      },
      extra: {
        alignItems: 'center',
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        gap: token.sizeXS,
        justifyContent: 'center' as const,
        marginTop: sizeConfig.extraMarginTop(token),
      },
    };
  },
);
