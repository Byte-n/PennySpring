import { createUseSheetStyle } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

interface IndexBarStyleOptions {
  disabled: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  letterSize: number;
  letterRadius: number;
  letterFontSize: number;
  sidebarWidth: number;
  sidebarGap: number;
  bubbleSize: number;
}

/** AliasToken 没有索引字母档位；视觉 20 / 24 / 28、条宽 36 / 36 / 40 为语义常量。 */
const LETTER_SMALL = 20;
const LETTER_NORMAL = 24;
const LETTER_LARGE = 28;
const PANEL_TITLE_HEIGHT = 32;
const PANEL_TITLE_FONT_SIZE = 12;
const PANEL_TITLE_LETTER_SPACING = 0.96;
const BUBBLE_SIZE = 64;

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    letterSize: LETTER_SMALL,
    letterRadius: 6,
    letterFontSize: 11,
    sidebarWidth: 36,
    sidebarGap: 1,
    bubbleSize: BUBBLE_SIZE,
  },
  normal: {
    letterSize: LETTER_NORMAL,
    letterRadius: 8,
    letterFontSize: 12,
    sidebarWidth: 36,
    sidebarGap: 2,
    bubbleSize: BUBBLE_SIZE,
  },
  large: {
    letterSize: LETTER_LARGE,
    letterRadius: 8,
    letterFontSize: 13,
    sidebarWidth: 40,
    sidebarGap: 3,
    bubbleSize: BUBBLE_SIZE,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { disabled: _disabled, size }: IndexBarStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        alignItems: 'stretch',
        flexGrow: 1,
        flexShrink: 1,
      },
      contentWrapper: {
        flex: 1,
        minWidth: 0,
        position: 'relative' as const,
      },
      content: {
        flex: 1,
        minWidth: 0,
      },
      panel: {
        backgroundColor: token.colorBgContainer,
      },
      panelTitleContainer: {
        alignItems: 'center',
        backgroundColor: token.colorBgContainer,
        flexDirection: 'row' as const,
        height: PANEL_TITLE_HEIGHT,
        paddingHorizontal: token.padding,
      },
      panelTitleText: {
        fontSize: PANEL_TITLE_FONT_SIZE,
        letterSpacing: PANEL_TITLE_LETTER_SPACING,
        lineHeight: PANEL_TITLE_HEIGHT,
      },
      sidebar: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: token.paddingXS,
        gap: sizeConfig.sidebarGap,
        width: sizeConfig.sidebarWidth,
      },
      indexItem: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: sizeConfig.letterSize,
        minWidth: sizeConfig.letterSize,
        paddingHorizontal: token.paddingXXS,
        width: sizeConfig.sidebarWidth,
      },
      indexLetter: {
        alignItems: 'center',
        borderRadius: sizeConfig.letterRadius,
        height: sizeConfig.letterSize,
        justifyContent: 'center',
        width: sizeConfig.letterSize,
      },
      indexItemPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      indexLetterActive: {
        backgroundColor: token.colorPrimary,
      },
      indexText: {
        fontSize: sizeConfig.letterFontSize,
        fontVariant: ['tabular-nums' as const],
        lineHeight: sizeConfig.letterSize,
        textAlign: 'center' as const,
      },
      indexTextActive: {
        color: token.colorTextLightSolid,
      },
      indexTextDisabled: {
        color: token.colorTextQuaternary,
      },
      bubbleOverlay: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        position: 'absolute' as const,
        right: 0,
        top: 0,
      },
      bubble: {
        alignItems: 'center',
        backgroundColor: token.colorPrimaryBg,
        borderRadius: token.borderRadiusLG,
        height: sizeConfig.bubbleSize,
        justifyContent: 'center',
        width: sizeConfig.bubbleSize,
      },
      bubbleText: {
        lineHeight: sizeConfig.bubbleSize,
        textAlign: 'center' as const,
      },
    };
  },
);
