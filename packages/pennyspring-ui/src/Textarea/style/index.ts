import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { TextareaStatus } from '../types';

export interface TextareaStyleOptions {
  contentHeight: number;
  isDisabled: boolean;
  isFocused: boolean;
  maxRows: number;
  minRows: number;
  size: ComponentSize;
  status: TextareaStatus;
}

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  labelSize: 'xs' | 'sm';
  lineHeight: (token: AliasToken) => number;
}

const DEFAULT_MIN_ROWS = 3;
const MIN_ALLOWED_ROWS = 1;
/** 指示条与字段内边距在 AliasToken 中没有档位，按设计稿落为语义常量。 */
const INDICATOR_HEIGHT = 2;

export const SIZE_CONFIG: Record<ComponentSize, SizeConfig> = {
  small: {
    fontSize: token => token.fontSizeSM,
    labelSize: 'xs',
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    fontSize: token => token.fontSize,
    labelSize: 'sm',
    lineHeight: token => token.lineHeight,
  },
  large: {
    fontSize: token => token.fontSizeLG,
    labelSize: 'sm',
    lineHeight: token => token.lineHeightLG,
  },
};

export function resolveRows(rows: number | undefined, fallback: number): number {
  return Math.max(MIN_ALLOWED_ROWS, Math.floor(rows ?? fallback));
}

export function resolveMaxRows(minRows: number, maxRows?: number): number {
  return Math.max(minRows, resolveRows(maxRows, minRows));
}

export function getRowHeight(size: ComponentSize, token: AliasToken): number {
  return SIZE_CONFIG[size].lineHeight(token);
}

export function getVerticalPadding(_size: ComponentSize, token: AliasToken): number {
  return token.marginXS;
}

export function getFieldHeight(
  rows: number,
  size: ComponentSize,
  token: AliasToken,
): number {
  return getRowHeight(size, token) * rows + getVerticalPadding(size, token) * 2;
}

export function clampHeight(value: number, minHeight: number, maxHeight: number): number {
  return Math.min(Math.max(value, minHeight), maxHeight);
}

/** 指示条取同族基础色：错误 / 警示 / 成功各自换色，聚焦时用主色。 */
export function getIndicatorColor(status: TextareaStatus, token: AliasToken): string {
  if (status === 'error') {
    return token.colorError;
  }

  if (status === 'warning') {
    return token.colorWarning;
  }

  if (status === 'success') {
    return token.colorSuccess;
  }

  return token.colorPrimary;
}

export function getTextColor(
  token: AliasToken,
  {
    isDisabled,
  }: {
    isDisabled: boolean;
  },
): string {
  return isDisabled ? token.colorTextQuaternary : token.colorText;
}

export { DEFAULT_MIN_ROWS, INDICATOR_HEIGHT, MIN_ALLOWED_ROWS };

export const useStyles = createUseSheetStyle(
  (token, options: TextareaStyleOptions) => {
    const sizeConfig = SIZE_CONFIG[options.size];
    const lineHeight = sizeConfig.lineHeight(token);
    const minHeight = getFieldHeight(options.minRows, options.size, token);
    const maxHeight = getFieldHeight(options.maxRows, options.size, token);
    const verticalPadding = getVerticalPadding(options.size, token);
    const height =
      options.contentHeight > 0
        ? clampHeight(options.contentHeight + verticalPadding * 2, minHeight, maxHeight)
        : minHeight;

    return {
      root: {
        gap: token.marginXS,
      },
      labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.marginXXS,
        marginBottom: token.marginXS,
      },
      field: {
        minHeight,
        maxHeight,
        height,
        backgroundColor: 'transparent',
        borderBottomColor: options.isDisabled ? token.colorSplit : token.colorBorder,
        borderBottomWidth: token.lineWidth,
        borderRadius: 0,
        paddingHorizontal: 0,
        paddingVertical: verticalPadding,
      },
      indicator: {
        position: 'absolute' as const,
        left: 0,
        right: 0,
        bottom: -token.lineWidth,
        height: INDICATOR_HEIGHT,
        backgroundColor: getIndicatorColor(options.status, token),
        transformOrigin: 'left center' as const,
      },
      input: {
        // 撑满 field 内容区，避免空值时空白区域点击无法聚焦
        flex: 1,
        minHeight: lineHeight,
        color: options.isDisabled ? token.colorTextQuaternary : token.colorText,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight,
        padding: 0,
        margin: 0,
        textAlignVertical: 'top' as const,
      },
      inputReadonly: {
        color: token.colorTextSecondary,
      },
      helper: {
        flex: 1,
      },
      error: {
        flex: 1,
      },
      footer: {
        minHeight: token.lineHeightXS,
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
        justifyContent: 'space-between' as const,
        gap: token.marginXS,
        marginTop: token.marginXS,
      },
      count: {
        flexShrink: 0,
      },
      loading: {
        flexShrink: 0,
      },
    };
  },
);
