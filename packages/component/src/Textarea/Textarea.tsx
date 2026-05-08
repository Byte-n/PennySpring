import React, { useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Text } from '../Text';
import type {
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  TextInputProps,
  TextStyle,
} from 'react-native';
import type { AccessibilityState } from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type {
  TextareaProps,
  TextareaSize,
  TextareaStatus,
} from './types';

const DEFAULT_MIN_ROWS = 3;
const MIN_ALLOWED_ROWS = 1;

interface TextareaStyleOptions {
  contentHeight: number;
  isDisabled: boolean;
  isError: boolean;
  isFocused: boolean;
  status: TextareaStatus;
  minRows: number;
  maxRows: number;
  size: TextareaSize;
}

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  footerGap: (token: AliasToken) => number;
}

type TextareaAccessibilityState = AccessibilityState & {
  invalid?: boolean;
};

const SIZE_CONFIG: Record<TextareaSize, SizeConfig> = {
  small: {
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.paddingXS,
    footerGap: token => token.marginXXS,
  },
  normal: {
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.paddingSM,
    footerGap: token => token.marginXS,
  },
  large: {
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingMD,
    footerGap: token => token.marginSM,
  },
};

function resolveRows(rows: number | undefined, fallback: number): number {
  return Math.max(MIN_ALLOWED_ROWS, Math.floor(rows ?? fallback));
}

function resolveMaxRows(minRows: number, maxRows?: number): number {
  return Math.max(minRows, resolveRows(maxRows, minRows));
}

function getRowHeight(size: TextareaSize, token: AliasToken): number {
  return SIZE_CONFIG[size].lineHeight(token);
}

function getVerticalPadding(size: TextareaSize, token: AliasToken): number {
  return SIZE_CONFIG[size].paddingVertical(token);
}

function getFieldHeight(
  rows: number,
  size: TextareaSize,
  token: AliasToken,
): number {
  const borderSize = token.lineWidth * 2;

  return getRowHeight(size, token) * rows + getVerticalPadding(size, token) * 2 + borderSize;
}

function clampHeight(value: number, minHeight: number, maxHeight: number): number {
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

const useStyles = createUseSheetStyle(
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
        gap: token.marginXXS,
      },
      labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.marginXXS,
      },
      label: {
        color: options.isDisabled ? token.colorTextDisabled : token.colorTextLabel,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        fontWeight: String(token.fontWeightMedium) as TextStyle['fontWeight'],
      },
      requiredMark: {
        color: token.colorError,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
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
        borderWidth: token.lineWidthBold,
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
        minHeight: lineHeight,
        color: options.isDisabled ? token.colorTextDisabled : token.colorText,
        fontFamily: token.fontFamily,
        fontSize,
        lineHeight,
        padding: 0,
        margin: 0,
        textAlignVertical: 'top',
      },
      footer: {
        minHeight: token.lineHeightSM,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: sizeConfig.footerGap(token),
      },
      helper: {
        flex: 1,
        color: token.colorTextDescription,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
      },
      error: {
        flex: 1,
        color: token.colorErrorText,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
      },
      count: {
        color: token.colorTextTertiary,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
      },
      loading: {
        position: 'absolute',
        top: sizeConfig.paddingVertical(token),
        right: sizeConfig.paddingHorizontal(token),
      },
    };
  },
);

export function Textarea({
  accessibilityLabel,
  defaultValue,
  disabled = false,
  errorText,
  helperText,
  label,
  loading = false,
  maxLength,
  maxRows,
  minRows,
  onBlur,
  onChangeText,
  onContentSizeChange,
  onFocus,
  placeholder,
  readonly = false,
  required = false,
  showCount = false,
  size = 'normal',
  status = 'default',
  style,
  styles,
  value,
  ...rest
}: TextareaProps) {
  const { token } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const resolvedMinRows = resolveRows(minRows, DEFAULT_MIN_ROWS);
  const resolvedMaxRows = resolveMaxRows(resolvedMinRows, maxRows);
  const mergedValue = value ?? internalValue;
  const textValue = String(mergedValue);
  const isEditable = !disabled && !readonly;
  const isError = status === 'error';
  const shouldShowErrorText = isError && errorText !== undefined && errorText !== null;
  const fieldAccessibilityState: TextareaAccessibilityState = {
    busy: loading || undefined,
    disabled: disabled || undefined,
    invalid: isError || undefined,
  };
  const inferredAccessibilityLabel =
    accessibilityLabel ?? (typeof label === 'string' ? label : undefined);
  const accessibilityHint =
    rest.accessibilityHint ??
    (shouldShowErrorText && typeof errorText === 'string' ? errorText : undefined);
  const tokenStyles = useStyles({
    contentHeight,
    isDisabled: disabled,
    isError,
    isFocused,
    maxRows: resolvedMaxRows,
    minRows: resolvedMinRows,
    size,
    status,
  });

  function handleFocus(event: Parameters<NonNullable<TextInputProps['onFocus']>>[0]): void {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: Parameters<NonNullable<TextInputProps['onBlur']>>[0]): void {
    setIsFocused(false);
    onBlur?.(event);
  }

  function handleChangeText(text: string): void {
    if (value === undefined) {
      setInternalValue(text);
    }

    onChangeText?.(text);
  }

  function handleContentSizeChange(
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ): void {
    const minHeight = getFieldHeight(resolvedMinRows, size, token);
    const maxHeight = getFieldHeight(resolvedMaxRows, size, token);

    setContentHeight(
      clampHeight(event.nativeEvent.contentSize.height, minHeight, maxHeight),
    );
    onContentSizeChange?.(event);
  }

  const countText =
    maxLength === undefined ? `${textValue.length}` : `${textValue.length} / ${maxLength}`;

  return (
    <View style={[tokenStyles.root, style]}>
      {label !== undefined && label !== null ? (
        <View style={tokenStyles.labelRow}>
          <Text style={[tokenStyles.label, styles?.label]}>{label}</Text>
          {required ? <Text style={tokenStyles.requiredMark}>*</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          tokenStyles.field,
          styles?.field,
          readonly ? tokenStyles.fieldReadonly : null,
          disabled ? tokenStyles.fieldDisabled : null,
          disabled ? styles?.fieldDisabled : null,
          isError ? tokenStyles.fieldError : null,
          isError ? styles?.fieldError : null,
          isFocused ? tokenStyles.fieldFocused : null,
          isFocused ? styles?.fieldFocused : null,
        ]}
      >
        <TextInput
          {...rest}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={inferredAccessibilityLabel}
          accessibilityState={fieldAccessibilityState}
          editable={isEditable}
          maxLength={maxLength}
          multiline
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onContentSizeChange={handleContentSizeChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={token.colorTextPlaceholder}
          style={[tokenStyles.input, styles?.input]}
          value={textValue}
        />
        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Loading"
            color={token.colorPrimary}
            size="small"
            style={tokenStyles.loading}
          />
        ) : null}
      </View>

      {helperText !== undefined || errorText !== undefined || showCount ? (
        <View style={[tokenStyles.footer, styles?.footer]}>
          {shouldShowErrorText ? (
            <Text style={[tokenStyles.error, styles?.error]}>{errorText}</Text>
          ) : helperText !== undefined && helperText !== null ? (
            <Text style={[tokenStyles.helper, styles?.helper]}>{helperText}</Text>
          ) : (
            <View />
          )}
          {showCount ? (
            <Text style={[tokenStyles.count, styles?.count]}>{countText}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
