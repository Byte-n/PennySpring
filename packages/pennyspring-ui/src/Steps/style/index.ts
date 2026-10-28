import { createUseSheetStyle } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { TextSize } from '../../Text';

export interface StepsStyleOptions {
  size: ComponentSize;
}

interface SizeStyleConfig {
  indicatorSize: number;
  indicatorIconSize: number;
  indicatorTextSize: TextSize;
  titleSize: TextSize;
  descriptionSize: TextSize;
}

/** AliasToken 没有步骤指示器档位；20 / 24 / 28 与 4px 外环为语义常量。 */
const STEP_DOT_SMALL = 20;
const STEP_DOT_NORMAL = 24;
const STEP_DOT_LARGE = 28;
const PROCESS_RING_SIZE = 4;
const CONNECTOR_MIN_HEIGHT = 24;
const CONNECTOR_MARGIN_TOP = 4;
const DISABLED_OPACITY = 0.45;
const PILL_RADIUS = 999;

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    indicatorSize: STEP_DOT_SMALL,
    indicatorIconSize: 12,
    indicatorTextSize: 'xs',
    titleSize: 'sm',
    descriptionSize: 'xs',
  },
  normal: {
    indicatorSize: STEP_DOT_NORMAL,
    indicatorIconSize: 14,
    indicatorTextSize: 'xs',
    titleSize: 'md',
    descriptionSize: 'xs',
  },
  large: {
    indicatorSize: STEP_DOT_LARGE,
    indicatorIconSize: 16,
    indicatorTextSize: 'sm',
    titleSize: 'lg',
    descriptionSize: 'sm',
  },
};

export const useStyles = createUseSheetStyle(
  (token, { size }: StepsStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const railWidth = sizeConfig.indicatorSize;

    return {
      root: {
        alignSelf: 'stretch',
        width: '100%',
      },
      item: {
        borderRadius: token.borderRadiusSM,
        width: '100%',
      },
      itemPressed: {
        backgroundColor: token.colorFillTertiary,
      },
      itemDisabled: {
        opacity: DISABLED_OPACITY,
      },
      stepHeader: {
        width: railWidth,
      },
      indicatorRing: {
        alignItems: 'center',
        borderRadius: PILL_RADIUS,
        justifyContent: 'center',
        marginHorizontal: -PROCESS_RING_SIZE,
        padding: PROCESS_RING_SIZE,
      },
      indicatorRingProcess: {
        backgroundColor: token.colorPrimaryBg,
      },
      indicator: {
        alignItems: 'center',
        borderRadius: PILL_RADIUS,
        height: sizeConfig.indicatorSize,
        justifyContent: 'center',
        width: sizeConfig.indicatorSize,
      },
      indicatorWait: {
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderWidth: token.lineWidth,
      },
      indicatorProcess: {
        backgroundColor: token.colorPrimary,
      },
      indicatorFinish: {
        backgroundColor: token.colorSuccess,
      },
      indicatorError: {
        backgroundColor: token.colorError,
      },
      connector: {
        backgroundColor: token.colorSplit,
        borderRadius: token.lineWidthBold / 2,
        flex: 1,
        marginTop: CONNECTOR_MARGIN_TOP,
        minHeight: CONNECTOR_MIN_HEIGHT,
        width: token.lineWidthBold,
      },
      connectorFinish: {
        backgroundColor: token.colorSuccess,
      },
      content: {
        flex: 1,
        gap: token.marginXXS / 2,
        paddingBottom: token.paddingMD,
      },
      contentLast: {
        paddingBottom: 0,
      },
    };
  },
);
