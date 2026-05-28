import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { TextSize } from '../../Text/types';

interface SizeStyleConfig {
  height: (token: AliasToken) => number;
  buttonWidth: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    height: token => token.controlHeightSM,
    buttonWidth: token => token.controlHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
  },
  normal: {
    height: token => token.controlHeight,
    buttonWidth: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
  },
  large: {
    height: token => token.controlHeightLG,
    buttonWidth: token => token.controlHeightLG,
    paddingHorizontal: token => token.controlPaddingHorizontal,
  },
};

export const SIZE_TO_TEXT_SIZE: Record<ComponentSize, TextSize> = {
  small: 'sm',
  normal: 'md',
  large: 'lg',
};

export const useStyles = createUseSheetStyle(
  (token, size: ComponentSize) => {
    const config = SIZE_STYLE_MAP[size];

    return {
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: token.lineWidth,
        borderColor: token.colorBorder,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgContainer,
        height: config.height(token),
      },
      containerDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
        borderColor: token.colorBorderDisabled,
      },
      button: {
        width: config.buttonWidth(token),
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonPressed: {
        backgroundColor: token.controlItemBgActive,
      },
      buttonText: {},
      buttonTextDisabled: {},
      input: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: token.lineWidth,
        borderRightWidth: token.lineWidth,
        borderColor: token.colorBorder,
        paddingHorizontal: config.paddingHorizontal(token),
      },
      inputDisabled: {
        borderColor: token.colorBorderDisabled,
      },
      inputText: {},
      inputTextDisabled: {},
    };
  },
);
