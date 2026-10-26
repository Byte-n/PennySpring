import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { TextareaStatus } from '../types';

export interface TextareaStyleOptions {
  contentHeight: number;
  isDisabled: boolean;
  isError: boolean;
  isFocused: boolean;
  status: TextareaStatus;
  minRows: number;
  maxRows: number;
  size: ComponentSize;
}

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  footerGap: (token: AliasToken) => number;
}

const DEFAULT_MIN_ROWS = 3;
const MIN_ALLOWED_ROWS = 1;

export const SIZE_CONFIG: Record<ComponentSize, SizeConfig> = {
  small: {
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.controlPaddingHorizontalSM / 2,
    footerGap: token => token.marginXXS,
  },
  normal: {
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.controlPaddingHorizontal / 2,
    footerGap: token => token.marginXS,
  },
  large: {
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingMD / 2,
    footerGap: token => token.marginSM,
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

export function getVerticalPadding(size: ComponentSize, token: AliasToken): number {
  return SIZE_CONFIG[size].paddingVertical(token);
}

export function getFieldHeight(
  rows: number,
  size: ComponentSize,
  token: AliasToken,
): number {
  const borderSize = token.lineWidth * 2;

  return getRowHeight(size, token) * rows + getVerticalPadding(size, token) * 2 + borderSize;
}

export function clampHeight(value: number, minHeight: number, maxHeight: number): number {
  return Math.min(Math.max(value, minHeight), maxHeight);
}

function getStatusBorderColor(status: TextareaStatus, token: AliasToken): string {
  if (status === 'error') {
    return token.colorErrorBorder;
  }

  if (status === 'warning') {
    return token.colorWarningBorder;
  }

  if (status === 'success') {
    return token.colorSuccessBorder;
  }

  return token.colorBorder;
}

export { DEFAULT_MIN_ROWS, MIN_ALLOWED_ROWS };

export const useStyles = createUseSheetStyle(
  (token, options: TextareaStyleOptions) => {
    const sizeConfig = SIZE_CONFIG[options.size];
    const fontSize = sizeConfig.fontSize(token);
    const lineHeight = sizeConfig.lineHeight(token);
    const minHeight = getFieldHeight(options.minRows, options.size, token);
    const maxHeight = getFieldHeight(options.maxRows, options.size, token);
    const height =
      options.contentHeight > 0
        ? clampHeight(
            options.contentHeight + getVerticalPadding(options.size, token) * 2,
            minHeight,
            maxHeight,
          )
        : minHeight;

    return {
      root: {
        gap: token.marginXS,
      },
      labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.marginXXS,
      },
      field: {
        minHeight,
        maxHeight,
        height,
        borderWidth: token.lineWidth,
        borderColor: getStatusBorderColor(options.status, token),
        borderRadius: token.borderRadius,
        backgroundColor: options.isDisabled
          ? token.colorBgContainerDisabled
          : token.colorBgContainer,
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingVertical: sizeConfig.paddingVertical(token),
      },
      fieldFocused: {
        borderColor: options.isError ? token.colorError : token.colorPrimary,
      },
      fieldError: {
        borderColor: token.colorErrorBorder,
        backgroundColor: token.colorErrorBg,
      },
      fieldDisabled: {
        borderColor: token.colorBorderDisabled,
        backgroundColor: token.colorBgContainerDisabled,
      },
      fieldReadonly: {
        backgroundColor: token.colorFillQuaternary,
      },
      input: {
        // 撑满 field 内容区，避免空值时空白区域点击无法聚焦
        flex: 1,
        minHeight: lineHeight,
        color: options.isDisabled ? token.colorTextDisabled : token.colorText,
        fontFamily: token.fontFamily,
        fontSize,
        lineHeight,
        padding: 0,
        margin: 0,
        textAlignVertical: 'top',
      },
      helper: {
        flex: 1,
      },
      error: {
        flex: 1,
      },
      footer: {
        minHeight: token.lineHeightSM,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: sizeConfig.footerGap(token),
      },
      loading: {
        position: 'absolute',
        top: sizeConfig.paddingVertical(token),
        right: sizeConfig.paddingHorizontal(token),
      },
    };
  },
);
