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

const SIZE_CONFIG: SizeConfig = {
  keyHeight: token => token.controlHeightLG,
  okKeyHeight: token => token.controlHeightLG * OK_KEY_ROW_SPAN + token.sizeXS,
};

export const useStyles = createUseSheetStyle(
  (token, { disabled }: CalculatorInputStyleOptions) => ({
    display: {
      minHeight: token.controlHeightLG + token.controlHeightSM,
      paddingHorizontal: token.controlPaddingHorizontal,
      paddingVertical: token.controlPaddingHorizontal / 2,
      borderWidth: token.lineWidth,
      borderRadius: token.borderRadius,
      borderColor: disabled ? token.colorBorderDisabled : token.colorBorder,
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorBgContainer,
      justifyContent: 'center',
    },
    input: {
      padding: 0,
      margin: 0,
      fontFamily: token.fontFamilyCode,
      fontSize: token.fontSizeXL,
      lineHeight: token.lineHeightXL,
      color: disabled ? token.colorTextDisabled : token.colorTextHeading,
      textAlign: 'right',
    } as TextStyle,
    result: {
      minHeight: token.lineHeight,
      fontFamily: token.fontFamilyCode,
      textAlign: 'right',
    } as TextStyle,
    key: {
      flex: 1,
      minHeight: SIZE_CONFIG.keyHeight(token),
      borderRadius: token.borderRadius,
      borderWidth: token.lineWidth,
      borderColor: disabled ? token.colorBorderDisabled : token.colorBorder,
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorBgContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyPressed: {
      backgroundColor: token.colorBgTextActive,
      borderColor: token.colorPrimaryBorder,
    },
    operatorKey: {
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorFillQuaternary,
    },
    keyText: {
      fontFamily: token.fontFamily,
    },
    mutedKeyText: {
      color: disabled ? token.colorTextDisabled : token.colorTextSecondary,
    },
    okKey: {
      minHeight: SIZE_CONFIG.okKeyHeight(token),
      backgroundColor: disabled
        ? token.colorBgContainerDisabled
        : token.colorPrimary,
      borderColor: disabled ? token.colorBorderDisabled : token.colorPrimary,
    },
    okKeyPressed: {
      backgroundColor: token.colorPrimaryActive,
      borderColor: token.colorPrimaryActive,
    },
    okKeyUnavailable: {
      backgroundColor: token.colorBgContainerDisabled,
      borderColor: token.colorBorderDisabled,
    },
    okKeyText: {
      fontFamily: token.fontFamily,
    },
    okKeyTextUnavailable: {
      color: token.colorTextDisabled,
    },
    leftPad: {
      width: '75%'
    },
  }),
);
