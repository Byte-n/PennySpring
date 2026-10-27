import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { TextSize } from '../../Text/types';
import type { RadioDisplayType, RadioGroupDirection } from '../types';

const TRANSPARENT = 'transparent';

/** 外圈 16 / 20 / 24 在 AliasToken 中没有对应档位，按设计稿落为语义常量。 */
const CONTROL_SIZE_SMALL = 16;
const CONTROL_SIZE_NORMAL = 20;
const CONTROL_SIZE_LARGE = 24;

/** 圆点 10 无对应 token（8 = sizeXS，12 = paddingSM）。 */
const DOT_SIZE_NORMAL = 10;

/** 外圈、圆点与 chip 共用药丸圆角，token 无对应档位。 */
const PILL_RADIUS = 999;

/** block 组每行铺满的 chip 列数。 */
const BLOCK_CHIP_COLUMNS = 2;

/**
 * 描边与圆点过渡：设计稿要求 120ms 并标注为「局部常量」，
 * 主题 motionDuration* 最小档为 100ms 且语义不符。
 */
export const RADIO_TRANSITION_DURATION = 120;

export interface RadioSizeConfig {
  controlSize: number;
  dotSize: (token: AliasToken) => number;
  rowMinHeight: (token: AliasToken) => number;
  chipHeight: (token: AliasToken) => number;
  chipPaddingHorizontal: (token: AliasToken) => number;
  labelSize: TextSize;
}

export const SIZE_CONFIG: Record<ComponentSize, RadioSizeConfig> = {
  small: {
    controlSize: CONTROL_SIZE_SMALL,
    dotSize: token => token.sizeXS,
    rowMinHeight: token => token.controlHeightSM,
    chipHeight: token => token.controlHeightSM,
    chipPaddingHorizontal: token => token.paddingSM,
    labelSize: 'sm',
  },
  normal: {
    controlSize: CONTROL_SIZE_NORMAL,
    dotSize: () => DOT_SIZE_NORMAL,
    rowMinHeight: token => token.controlHeight,
    chipHeight: token => token.controlHeight,
    chipPaddingHorizontal: token => token.paddingSM,
    labelSize: 'sm',
  },
  large: {
    controlSize: CONTROL_SIZE_LARGE,
    dotSize: token => token.paddingSM,
    rowMinHeight: token => token.controlHeightLG,
    chipHeight: token => token.controlHeightLG,
    chipPaddingHorizontal: token => token.padding,
    labelSize: 'md',
  },
};

export interface RadioStyleOptions {
  block: boolean;
  displayType: RadioDisplayType;
  size: ComponentSize;
}

export const useStyles = createUseSheetStyle(
  (token, { block, displayType, size }: RadioStyleOptions) => {
    const sizeConfig = SIZE_CONFIG[size];
    const isButton = displayType === 'button';
    const dotSize = sizeConfig.dotSize(token);

    return {
      option: {
        alignItems: 'center',
        alignSelf: block ? 'stretch' : 'flex-start',
        backgroundColor: isButton ? token.colorFillTertiary : TRANSPARENT,
        borderRadius: isButton ? PILL_RADIUS : token.borderRadiusSM,
        flexDirection: 'row',
        justifyContent: isButton ? 'center' : 'flex-start',
        minHeight: isButton
          ? sizeConfig.chipHeight(token)
          : sizeConfig.rowMinHeight(token),
        paddingHorizontal: isButton
          ? sizeConfig.chipPaddingHorizontal(token)
          : token.sizeXXS,
      },
      optionPressed: {
        backgroundColor: isButton
          ? token.colorFillQuaternary
          : token.colorFillTertiary,
      },
      optionSelected: {
        backgroundColor: isButton ? token.colorPrimaryBg : undefined,
      },
      optionDisabled: {
        backgroundColor: isButton ? token.colorFillQuaternary : undefined,
      },
      content: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: token.marginXS,
        justifyContent: isButton ? 'center' : 'flex-start',
      },
      control: {
        alignItems: 'center',
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderRadius: PILL_RADIUS,
        borderWidth: token.lineWidthBold,
        height: sizeConfig.controlSize,
        justifyContent: 'center',
        width: sizeConfig.controlSize,
      },
      controlSelected: {
        borderColor: token.colorPrimary,
      },
      controlDisabled: {
        backgroundColor: token.colorFillQuaternary,
        borderColor: token.colorSplit,
      },
      indicator: {
        backgroundColor: token.colorPrimary,
        borderRadius: PILL_RADIUS,
        height: dotSize,
        width: dotSize,
      },
      indicatorDisabled: {
        backgroundColor: token.colorTextQuaternary,
      },
      label: {
        flexShrink: 1,
      },
    };
  },
);

export interface RadioGroupStyleOptions {
  block: boolean;
  direction: RadioGroupDirection;
  isBlockGrid: boolean;
}

export const useGroupStyles = createUseSheetStyle(
  (token, { block, direction, isBlockGrid }: RadioGroupStyleOptions) => {
    const isHorizontal = direction === 'horizontal';

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        flexDirection: isHorizontal ? 'row' : 'column',
        flexWrap: isHorizontal ? 'wrap' : undefined,
        /** 设计稿纵向组间距 2px 无对应 token，按 Token 标注退到 sizeXXS；横向 gap 8 = sizeXS。 */
        gap: isBlockGrid ? 0 : isHorizontal ? token.sizeXS : token.sizeXXS,
        width: block ? '100%' : undefined,
      },
      blockCell: {
        padding: token.sizeXXS,
        width: `${100 / BLOCK_CHIP_COLUMNS}%`,
      },
    };
  },
);
