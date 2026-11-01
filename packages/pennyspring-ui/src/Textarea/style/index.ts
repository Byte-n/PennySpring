import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import { FIELD_SIZE_MAP } from '../../shares/fieldMetrics';
import type { ComponentSize } from '../../shares/types';
import type { TextareaStatus } from '../types';

export interface TextareaStyleOptions {
  contentHeight: number;
  hasLabel: boolean;
  isDisabled: boolean;
  maxRows: number;
  minRows: number;
  size: ComponentSize;
  status: TextareaStatus;
}

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const DEFAULT_MIN_ROWS = 3;
const MIN_ALLOWED_ROWS = 1;
/** 指示条与字段内边距在 AliasToken 中没有档位，按设计稿落为语义常量。 */
const INDICATOR_HEIGHT = 2;

export const SIZE_CONFIG: Record<ComponentSize, SizeConfig> = {
  small: {
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

export function resolveRows(
  rows: number | undefined,
  fallback: number,
): number {
  return Math.max(MIN_ALLOWED_ROWS, Math.floor(rows ?? fallback));
}

export function resolveMaxRows(minRows: number, maxRows?: number): number {
  return Math.max(minRows, resolveRows(maxRows, minRows));
}

export function getRowHeight(size: ComponentSize, token: AliasToken): number {
  return SIZE_CONFIG[size].lineHeight(token);
}

export function getVerticalPadding(
  _size: ComponentSize,
  token: AliasToken,
): number {
  return token.marginXS;
}

/** 有标签时，正文从标签带下方开始；标签度量与 Input 同源。 */
export function getContentTop(
  size: ComponentSize,
  token: AliasToken,
  hasLabel: boolean,
): number {
  if (!hasLabel) {
    return getVerticalPadding(size, token);
  }

  const metrics = FIELD_SIZE_MAP[size];

  return (
    metrics.labelTop +
    metrics.labelLineHeight(token) +
    metrics.valuePaddingBottom
  );
}

export function getFieldHeight(
  rows: number,
  size: ComponentSize,
  token: AliasToken,
  hasLabel = false,
): number {
  return (
    getContentTop(size, token, hasLabel) +
    getRowHeight(size, token) * rows +
    getVerticalPadding(size, token)
  );
}

export function clampHeight(
  value: number,
  minHeight: number,
  maxHeight: number,
): number {
  return Math.min(Math.max(value, minHeight), maxHeight);
}

/** 指示条取同族基础色：错误 / 警示 / 成功各自换色，聚焦时用主色。 */
export function getIndicatorColor(
  status: TextareaStatus,
  token: AliasToken,
): string {
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

function getStatusColor(
  status: TextareaStatus,
  token: AliasToken,
): string | null {
  if (status === 'error') {
    return token.colorError;
  }

  if (status === 'warning') {
    return token.colorWarning;
  }

  if (status === 'success') {
    return token.colorSuccess;
  }

  return null;
}

export { DEFAULT_MIN_ROWS, INDICATOR_HEIGHT, MIN_ALLOWED_ROWS };

export const useStyles = createUseSheetStyle(
  (token, options: TextareaStyleOptions) => {
    const sizeConfig = SIZE_CONFIG[options.size];
    const lineHeight = sizeConfig.lineHeight(token);
    const verticalPadding = getVerticalPadding(options.size, token);
    const contentTop = getContentTop(options.size, token, options.hasLabel);
    const minHeight = getFieldHeight(
      options.minRows,
      options.size,
      token,
      options.hasLabel,
    );
    const maxHeight = getFieldHeight(
      options.maxRows,
      options.size,
      token,
      options.hasLabel,
    );
    const height =
      options.contentHeight > 0
        ? clampHeight(
            options.contentHeight + contentTop + verticalPadding,
            minHeight,
            maxHeight,
          )
        : minHeight;
    const statusColor = getStatusColor(options.status, token);
    // 静止态只有 error 会染红标签；warning / success 在浮起后生效
    const labelRestColor = options.isDisabled
      ? token.colorTextQuaternary
      : options.status === 'error'
        ? token.colorError
        : token.colorTextPlaceholder;
    const labelFilledColor = options.isDisabled
      ? token.colorTextQuaternary
      : (statusColor ?? token.colorTextTertiary);
    const labelActiveColor = options.isDisabled
      ? token.colorTextQuaternary
      : (statusColor ?? token.colorPrimary);

    return {
      root: {
        gap: token.marginXS,
      },
      field: {
        minHeight,
        maxHeight,
        height,
        backgroundColor: 'transparent',
        borderBottomColor: options.isDisabled
          ? token.colorSplit
          : token.colorBorder,
        borderBottomWidth: token.lineWidth,
        borderRadius: 0,
        paddingHorizontal: 0,
        paddingVertical: verticalPadding,
        position: 'relative',
      },
      // 标签带只在有 label 时占用，避免无 label 场景凭空变高
      fieldWithLabel: {
        paddingTop: contentTop,
      },
      labelContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: token.zIndexBase,
      },
      label: {
        color: labelRestColor,
        fontFamily: token.fontFamily,
      },
      // 标签浮起后承担“字段名”职责，用 tertiary 保证小字号可读性
      labelFilled: {
        color: labelFilledColor,
      },
      labelActive: {
        color: labelActiveColor,
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
      footer: {
        minHeight: token.lineHeightXS,
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
        justifyContent: 'flex-end' as const,
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
