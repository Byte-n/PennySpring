import { createUseSheetStyle, PresetColors } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../../shares/types';
import type { SwipeActionColor } from '../types';

export interface SwipeActionStyleOptions {
  size: ComponentSize;
  disabled: boolean;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  actionMinWidth: (token: AliasToken) => number;
  actionPaddingHorizontal: (token: AliasToken) => number;
}

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    actionMinWidth: token => token.controlHeight,
    actionPaddingHorizontal: token => token.paddingSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    actionMinWidth: token => token.controlHeightLG,
    actionPaddingHorizontal: token => token.paddingMD,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    actionMinWidth: token => token.controlHeightLG + token.controlHeightXS,
    actionPaddingHorizontal: token => token.paddingLG,
  },
};

export const PRESET_COLOR_BG_MAP: Partial<
  Record<(typeof PresetColors)[number], (token: AliasToken) => string>
> = {
  blue: token => token.blue6,
  purple: token => token.purple6,
  cyan: token => token.cyan6,
  green: token => token.green6,
  magenta: token => token.magenta6,
  pink: token => token.pink6,
  red: token => token.red6,
  orange: token => token.orange6,
  yellow: token => token.yellow6,
  volcano: token => token.volcano6,
  geekblue: token => token.geekblue6,
  lime: token => token.lime6,
  gold: token => token.gold6,
};

export const useStyles = createUseSheetStyle(
  (token, { disabled, size }: SwipeActionStyleOptions) => {
    const sizeStyle = SIZE_STYLE_MAP[size];

    return {
      root: {
        minHeight: sizeStyle.minHeight(token),
        overflow: 'hidden',
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgContainer,
      },
      track: {
        flexDirection: 'row',
        alignItems: 'stretch',
      },
      content: {
        flex: 1,
        minHeight: sizeStyle.minHeight(token),
        justifyContent: 'center',
        backgroundColor: token.colorBgContainer,
      },
      contentDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
      },
      actionsBase: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        flexDirection: 'row',
      },
      leftActions: {
        left: 0,
      },
      rightActions: {
        right: 0,
      },
      action: {
        minWidth: sizeStyle.actionMinWidth(token),
        paddingHorizontal: sizeStyle.actionPaddingHorizontal(token),
        justifyContent: 'center',
        alignItems: 'center',
      },
      actionDisabled: {
        opacity: token.opacityLoading,
      },
      actionPressed: {
        opacity: 0.85,
      },
      actionBgLight: {
        backgroundColor: token.colorFillSecondary,
      },
      actionBgWeak: {
        backgroundColor: token.colorFillTertiary,
      },
      actionBgPrimary: {
        backgroundColor: token.colorPrimary,
      },
      actionBgSuccess: {
        backgroundColor: token.colorSuccess,
      },
      actionBgWarning: {
        backgroundColor: token.colorWarning,
      },
      actionBgDanger: {
        backgroundColor: token.colorError,
      },
      rootDisabled: {
        backgroundColor: disabled
          ? token.colorBgContainerDisabled
          : token.colorBgContainer,
      },
    };
  },
);

export function resolveActionBackgroundStyle(
  color: SwipeActionColor,
  tokenStyles: Record<string, ViewStyle | TextStyle>,
  token: AliasToken,
): ViewStyle {
  if (color === 'light') {
    return tokenStyles.actionBgLight as ViewStyle;
  }

  if (color === 'weak') {
    return tokenStyles.actionBgWeak as ViewStyle;
  }

  if (color === 'success') {
    return tokenStyles.actionBgSuccess as ViewStyle;
  }

  if (color === 'warning') {
    return tokenStyles.actionBgWarning as ViewStyle;
  }

  if (color === 'danger') {
    return tokenStyles.actionBgDanger as ViewStyle;
  }

  const presetKey = color as (typeof PresetColors)[number];
  const presetBgFn = PRESET_COLOR_BG_MAP[presetKey];

  if (presetBgFn !== undefined) {
    return { backgroundColor: presetBgFn(token) } as ViewStyle;
  }

  return tokenStyles.actionBgPrimary as ViewStyle;
}

export function resolveActionTextColor(
  color: SwipeActionColor,
  actionDisabled: boolean,
): string {
  if (actionDisabled) {
    return 'disabled';
  }

  if (color === 'light' || color === 'weak') {
    return 'default';
  }

  return 'lightSolid';
}
