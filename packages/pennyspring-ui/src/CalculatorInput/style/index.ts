import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';

export interface CalculatorInputStyleOptions {
  disabled: boolean;
}

interface SizeConfig {
  keyHeight: (token: AliasToken) => number;
  okKeyHeight: (token: AliasToken) => number;
}

const OK_KEY_ROW_SPAN = 2;
const LEFT_KEYPAD_FLEX_RATIO = 3;

const SIZE_CONFIG: SizeConfig = {
  keyHeight: token => token.controlHeightLG,
  okKeyHeight: token => token.controlHeightLG * OK_KEY_ROW_SPAN + token.sizeXS,
};

export const useStyles = createUseSheetStyle(
  (token, { disabled }: CalculatorInputStyleOptions) => ({
    display: {
      minHeight: token.controlHeightLG + token.controlHeightSM,
      paddingHorizontal: token.padding,
      paddingTop: token.paddingXS,
      paddingBottom: token.paddingXS,
      borderRadius: token.borderRadiusLG,
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorFillQuaternary,
      justifyContent: 'flex-end',
    },
    input: {
      padding: 0,
      margin: 0,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: disabled ? token.colorTextDisabled : token.colorTextSecondary,
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    } as TextStyle,
    resultRow: {
      minHeight: token.lineHeightHeading3,
    },
    resultText: {
      lineHeight: token.lineHeightHeading3,
      fontVariant: ['tabular-nums'],
    } as TextStyle,
    key: {
      flex: 1,
      minHeight: SIZE_CONFIG.keyHeight(token),
      borderRadius: token.borderRadiusLG,
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorFillTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    functionKey: {
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorFillQuaternary,
    },
    operatorKey: {
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorPrimaryBg,
    },
    keyPressed: {
      backgroundColor: token.colorFillSecondary,
    },
    functionKeyPressed: {
      backgroundColor: token.colorFillTertiary,
    },
    operatorKeyPressed: {
      backgroundColor: token.colorPrimaryBgHover,
    },
    keyText: {
      fontFamily: token.fontFamily,
    },
    okKey: {
      minHeight: SIZE_CONFIG.okKeyHeight(token),
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorPrimary,
    },
    okKeyPressed: {
      backgroundColor: token.colorPrimaryActive,
    },
    okKeyUnavailable: {
      backgroundColor: token.colorBgContainerDisabled,
    },
    okKeyText: {
      fontFamily: token.fontFamily,
    },
    readonlyKeypad: {
      opacity: token.opacityLoading,
    },
    leftPad: {
      flex: LEFT_KEYPAD_FLEX_RATIO,
    },
  }),
);
