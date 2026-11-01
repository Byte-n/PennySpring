import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { TextSize } from '../../Text/types';

interface SizeStyleConfig {
  height: (token: AliasToken) => number;
  buttonSize: number;
  paddingHorizontal: number;
  inputMinWidth: number;
  iconSize: number;
}

/** 胶囊高度取 controlHeight，按钮 24 / 32 / 36、图标 12 / 16 / 18 为语义常量。 */
const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    height: token => token.controlHeightSM,
    buttonSize: 24,
    paddingHorizontal: 2,
    inputMinWidth: 32,
    iconSize: 12,
  },
  normal: {
    height: token => token.controlHeight,
    buttonSize: 32,
    paddingHorizontal: 2,
    inputMinWidth: 40,
    iconSize: 16,
  },
  large: {
    height: token => token.controlHeightLG,
    buttonSize: 36,
    paddingHorizontal: 4,
    inputMinWidth: 48,
    iconSize: 18,
  },
};

const PILL_RADIUS = 999;

export const SIZE_TO_TEXT_SIZE: Record<ComponentSize, TextSize> = {
  small: 'xs',
  normal: 'md',
  large: 'lg',
};

export function getSizeConfig(size: ComponentSize) {
  return SIZE_STYLE_MAP[size];
}

export const useStyles = createUseSheetStyle((token, size: ComponentSize) => {
  const config = SIZE_STYLE_MAP[size];

  return {
    container: {
      alignItems: 'center',
      backgroundColor: token.colorFillTertiary,
      borderRadius: PILL_RADIUS,
      flexDirection: 'row',
      height: config.height(token),
      paddingHorizontal: config.paddingHorizontal,
    },
    containerDisabled: {
      backgroundColor: token.colorFillQuaternary,
    },
    button: {
      alignItems: 'center',
      borderRadius: PILL_RADIUS,
      height: config.buttonSize,
      justifyContent: 'center',
      width: config.buttonSize,
    },
    buttonPressed: {
      backgroundColor: token.colorFillSecondary,
    },
    input: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      minWidth: config.inputMinWidth,
      paddingHorizontal: token.sizeXXS,
    },
    inputText: {
      fontFamily: token.fontFamily,
      fontVariant: ['tabular-nums'],
    },
    unit: {
      marginLeft: token.sizeXXS,
    },
  };
});
