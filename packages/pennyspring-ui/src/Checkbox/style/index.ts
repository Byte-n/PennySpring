import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { TextSize } from '../../Text/types';
import type { CheckboxDisplayType } from '../types';

const TRANSPARENT = 'transparent';

/** 勾选框边长 16 / 20 / 24 在 AliasToken 中没有对应档位，按设计稿落为语义常量。 */
const BOX_SIZE_SMALL = 16;
const BOX_SIZE_NORMAL = 20;
const BOX_SIZE_LARGE = 24;

/** 20 框的 6 圆角无对应 token（4 = borderRadiusXS，8 = borderRadiusSM）。 */
const BOX_RADIUS_NORMAL = 6;

/** 勾图标 12 / 14 / 16 与框同步，token 无对应档位。 */
const MARK_SIZE_SMALL = 12;
const MARK_SIZE_NORMAL = 14;
const MARK_SIZE_LARGE = 16;

/** chip 药丸圆角无对应 token。 */
const CHIP_RADIUS = 999;

/** chip 内勾与文字间距 6 无对应 token。 */
const CHIP_GAP = 6;

/** block 组每行铺满的 chip 列数。 */
const BLOCK_CHIP_COLUMNS = 2;

/**
 * 勾选过渡时长：设计稿要求 120ms，主题 motionDuration* 最小档为 100ms 且语义不符，
 * 按设计稿落为语义常量。
 */
export const MARK_TRANSITION_DURATION = 120;

export interface CheckboxSizeConfig {
  boxSize: number;
  boxRadius: (token: AliasToken) => number;
  markSize: number;
  rowMinHeight: (token: AliasToken) => number;
  chipHeight: (token: AliasToken) => number;
  chipPaddingHorizontal: (token: AliasToken) => number;
  labelSize: TextSize;
}

export const SIZE_CONFIG: Record<ComponentSize, CheckboxSizeConfig> = {
  small: {
    boxSize: BOX_SIZE_SMALL,
    boxRadius: token => token.borderRadiusXS,
    markSize: MARK_SIZE_SMALL,
    rowMinHeight: token => token.controlHeightSM,
    chipHeight: token => token.controlHeightSM,
    chipPaddingHorizontal: token => token.paddingSM,
    labelSize: 'sm',
  },
  normal: {
    boxSize: BOX_SIZE_NORMAL,
    boxRadius: () => BOX_RADIUS_NORMAL,
    markSize: MARK_SIZE_NORMAL,
    rowMinHeight: token => token.controlHeight,
    chipHeight: token => token.controlHeight,
    chipPaddingHorizontal: token => token.paddingSM,
    labelSize: 'sm',
  },
  large: {
    boxSize: BOX_SIZE_LARGE,
    boxRadius: token => token.borderRadiusSM,
    markSize: MARK_SIZE_LARGE,
    rowMinHeight: token => token.controlHeightLG,
    chipHeight: token => token.controlHeightLG,
    chipPaddingHorizontal: token => token.padding,
    labelSize: 'md',
  },
};

export interface CheckboxStyleOptions {
  block: boolean;
  displayType: CheckboxDisplayType;
  size: ComponentSize;
}

export const useStyles = createUseSheetStyle(
  (token, { block, displayType, size }: CheckboxStyleOptions) => {
    const sizeConfig = SIZE_CONFIG[size];
    const isButton = displayType === 'button';
    const markSize = sizeConfig.markSize;

    return {
      control: {
        alignItems: 'center',
        alignSelf: block ? 'stretch' : 'flex-start',
        backgroundColor: isButton ? token.colorFillTertiary : TRANSPARENT,
        borderRadius: isButton ? CHIP_RADIUS : token.borderRadiusSM,
        flexDirection: 'row',
        justifyContent: isButton ? 'center' : 'flex-start',
        minHeight: isButton
          ? sizeConfig.chipHeight(token)
          : sizeConfig.rowMinHeight(token),
        paddingHorizontal: isButton
          ? sizeConfig.chipPaddingHorizontal(token)
          : token.sizeXXS,
      },
      controlPressed: {
        backgroundColor: isButton
          ? token.colorFillQuaternary
          : token.colorFillTertiary,
      },
      controlChecked: {
        backgroundColor: isButton ? token.colorPrimaryBg : undefined,
      },
      controlDisabled: {
        backgroundColor: isButton ? token.colorFillQuaternary : undefined,
      },
      content: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: isButton ? CHIP_GAP : token.marginXS,
        justifyContent: isButton ? 'center' : 'flex-start',
      },
      indicator: {
        alignItems: 'center',
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderRadius: sizeConfig.boxRadius(token),
        borderWidth: token.lineWidth,
        height: sizeConfig.boxSize,
        justifyContent: 'center',
        width: sizeConfig.boxSize,
      },
      indicatorChecked: {
        backgroundColor: token.colorPrimary,
        borderColor: token.colorPrimary,
      },
      indicatorDisabled: {
        backgroundColor: token.colorFillQuaternary,
        borderColor: token.colorSplit,
      },
      indicatorDisabledChecked: {
        backgroundColor: token.colorFillTertiary,
        borderColor: token.colorSplit,
      },
      mark: {
        alignItems: 'center',
        justifyContent: 'center',
        height: markSize,
        width: markSize,
      },
      label: {
        flexShrink: 1,
      },
    };
  },
);

export interface CheckboxGroupStyleOptions {
  block: boolean;
  direction: 'horizontal' | 'vertical';
  isBlockGrid: boolean;
}

export const useGroupStyles = createUseSheetStyle(
  (token, { block, direction, isBlockGrid }: CheckboxGroupStyleOptions) => ({
    root: {
      alignSelf: block ? 'stretch' : 'flex-start',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      flexWrap: direction === 'horizontal' ? 'wrap' : undefined,
      gap: isBlockGrid ? 0 : token.sizeXS,
      width: block ? '100%' : undefined,
    },
    blockCell: {
      padding: token.sizeXXS,
      width: `${100 / BLOCK_CHIP_COLUMNS}%`,
    },
  }),
);
