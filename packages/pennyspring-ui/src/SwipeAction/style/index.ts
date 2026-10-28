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
  minHeight: number;
  actionWidth: number;
}

/** 行高与 List 行对齐；动作宽按两字竖排 + 图标留足位置。 */
const ROW_HEIGHT_SMALL = 56;
const ROW_HEIGHT_NORMAL = 64;
const ROW_HEIGHT_LARGE = 72;
const ACTION_WIDTH_SMALL = 64;
const ACTION_WIDTH_NORMAL = 72;
const ACTION_WIDTH_LARGE = 80;
const DANGER_ACTION_EXTRA_WIDTH = 8;
const ACTION_PRESS_SCALE = 0.98;
const ACTION_PRESS_OPACITY = 0.92;

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: ROW_HEIGHT_SMALL,
    actionWidth: ACTION_WIDTH_SMALL,
  },
  normal: {
    minHeight: ROW_HEIGHT_NORMAL,
    actionWidth: ACTION_WIDTH_NORMAL,
  },
  large: {
    minHeight: ROW_HEIGHT_LARGE,
    actionWidth: ACTION_WIDTH_LARGE,
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
        minHeight: sizeStyle.minHeight,
        overflow: 'hidden',
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgContainer,
      },
      track: {
        flexDirection: 'row',
        alignItems: 'stretch',
        overflow: 'hidden',
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgContainer,
      },
      content: {
        flex: 1,
        minHeight: sizeStyle.minHeight,
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
        justifyContent: 'center',
        alignItems: 'center',
        gap: token.sizeXXS,
      },
      actionWidth: {
        width: sizeStyle.actionWidth,
      },
      actionWidthDanger: {
        width: sizeStyle.actionWidth + DANGER_ACTION_EXTRA_WIDTH,
      },
      actionDisabled: {
        opacity: token.opacityLoading,
      },
      actionPressed: {
        opacity: ACTION_PRESS_OPACITY,
        transform: [{ scale: ACTION_PRESS_SCALE }],
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
      actionBgBlue: {
        backgroundColor: token.blue6,
      },
      actionBgPurple: {
        backgroundColor: token.purple6,
      },
      actionBgCyan: {
        backgroundColor: token.cyan6,
      },
      actionBgGreen: {
        backgroundColor: token.green6,
      },
      actionBgMagenta: {
        backgroundColor: token.magenta6,
      },
      actionBgPink: {
        backgroundColor: token.pink6,
      },
      actionBgRed: {
        backgroundColor: token.red6,
      },
      actionBgOrange: {
        backgroundColor: token.orange6,
      },
      actionBgYellow: {
        backgroundColor: token.yellow6,
      },
      actionBgVolcano: {
        backgroundColor: token.volcano6,
      },
      actionBgGeekblue: {
        backgroundColor: token.geekblue6,
      },
      actionBgLime: {
        backgroundColor: token.lime6,
      },
      actionBgGold: {
        backgroundColor: token.gold6,
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
  const styleKey = `actionBg${presetKey.charAt(0).toUpperCase()}${presetKey.slice(1)}`;
  const presetStyle = tokenStyles[styleKey];

  if (presetStyle !== undefined) {
    return presetStyle as ViewStyle;
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
