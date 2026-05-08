import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { NativeSyntheticEvent, TextInputFocusEventData, TextInputProps, TextStyle } from 'react-native';
import type { InputProps, InputSize, InputStatus } from './types';

interface InputStyleOptions {
  size: InputSize;
  status: InputStatus;
}

interface SizeConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

type StatusColorSelector = (token: AliasToken) => string;

const REQUIRED_MARK = '*';
const CLEAR_BUTTON_LABEL = '清除输入内容';

const SIZE_MAP: Record<InputSize, SizeConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.paddingXXS,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.paddingXS,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingSM,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

const STATUS_BORDER_COLOR_MAP: Record<InputStatus, StatusColorSelector> = {
  default: token => token.colorBorder,
  error: token => token.colorErrorBorder,
  warning: token => token.colorWarningBorder,
  success: token => token.colorSuccessBorder,
};

function resolveSize(size?: InputSize): InputSize {
  return size ?? 'normal';
}

function resolveStatus(status?: InputStatus): InputStatus {
  return status ?? 'default';
}

function resolveAccessibilityLabel(
  label: InputProps['label'],
  accessibilityLabel?: string,
): string | undefined {
  if (accessibilityLabel !== undefined) {
    return accessibilityLabel;
  }

  if (typeof label === 'string') {
    return label;
  }

  return undefined;
}

const useStyles = createUseSheetStyle(
  (token, { size, status }: InputStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      root: {
        gap: token.sizeXXS,
      },
      labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.sizeXXS,
      },
      label: {
        color: token.colorTextLabel,
      },
      requiredMark: {
        color: token.colorErrorText,
      },
      field: {
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingVertical: sizeConfig.paddingVertical(token),
        borderWidth: token.lineWidth,
        borderRadius: token.borderRadius,
        borderColor: STATUS_BORDER_COLOR_MAP[status](token),
        backgroundColor: token.colorBgContainer,
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizeConfig.gap(token),
      },
      fieldFocused: {
        borderColor: token.colorPrimary,
      },
      fieldError: {
        borderColor: token.colorError,
      },
      fieldWarning: {
        borderColor: token.colorWarning,
      },
      fieldSuccess: {
        borderColor: token.colorSuccess,
      },
      fieldDisabled: {
        borderColor: token.colorBorderDisabled,
        backgroundColor: token.colorBgContainerDisabled,
      },
      prefix: {
        flexShrink: 0,
      },
      suffix: {
        flexShrink: 0,
      },
      input: {
        flex: 1,
        minWidth: 0,
        padding: 0,
        margin: 0,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: token.colorText,
      } as TextStyle,
      inputDisabled: {
        color: token.colorTextDisabled,
      },
      clearButton: {
        minHeight: token.controlHeightSM,
        minWidth: token.controlHeightSM,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: token.borderRadiusSM,
      },
      clearButtonPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      clearButtonLabel: {
        color: token.colorTextTertiary,
      },
      helper: {
        color: token.colorTextDescription,
      },
      error: {
        color: token.colorErrorText,
      },
      loading: {
        flexShrink: 0,
      },
    };
  },
);

type InputAccessibilityState = TextInputProps['accessibilityState'] & {
  invalid?: boolean;
};

export function Input({
  accessibilityLabel,
  clearable,
  defaultValue,
  disabled,
  errorText,
  helperText,
  label,
  loading,
  onBlur,
  onChangeText,
  onClear,
  onFocus,
  placeholder,
  prefix,
  readonly,
  required,
  size,
  status,
  style,
  styles,
  suffix,
  value,
  accessibilityState,
  ...rest
}: InputProps) {
  const resolvedSize = resolveSize(size);
  const resolvedStatus = resolveStatus(status);
  const tokenStyles = useStyles({
    size: resolvedSize,
    status: resolvedStatus,
  });
  const { token } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const mergedValue = value ?? internalValue;
  const isEditable = !disabled && !readonly;
  const isError = resolvedStatus === 'error';
  const shouldShowClearButton =
    clearable === true && Boolean(mergedValue) && isEditable && loading !== true;
  const message = isError && errorText !== undefined ? errorText : helperText;
  const hasLabel = label !== undefined && label !== null;
  const hasPrefix = prefix !== undefined && prefix !== null;
  const hasSuffix = suffix !== undefined && suffix !== null;

  function handleClear(): void {
    if (value === undefined) {
      setInternalValue('');
    }

    if (onClear !== undefined) {
      onClear();
      return;
    }

    onChangeText?.('');
  }

  function handleChangeText(text: string): void {
    if (value === undefined) {
      setInternalValue(text);
    }

    onChangeText?.(text);
  }

  function handleFocus(
    event: Parameters<NonNullable<TextInputProps['onFocus']>>[0],
  ): void {
    setIsFocused(true);
    onFocus?.(event as NativeSyntheticEvent<TextInputFocusEventData>);
  }

  function handleBlur(
    event: Parameters<NonNullable<TextInputProps['onBlur']>>[0],
  ): void {
    setIsFocused(false);
    onBlur?.(event as NativeSyntheticEvent<TextInputFocusEventData>);
  }

  return (
    <View style={[tokenStyles.root, style]}>
      {hasLabel ? (
        <View style={tokenStyles.labelRow}>
          <Text style={[tokenStyles.label, styles?.label]}>{label}</Text>
          {required === true ? (
            <Text accessibilityElementsHidden style={tokenStyles.requiredMark}>
              {REQUIRED_MARK}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        style={[
          tokenStyles.field,
          styles?.field,
          isFocused ? tokenStyles.fieldFocused : null,
          isFocused ? styles?.fieldFocused : null,
          resolvedStatus === 'warning' ? tokenStyles.fieldWarning : null,
          resolvedStatus === 'success' ? tokenStyles.fieldSuccess : null,
          isError ? tokenStyles.fieldError : null,
          isError ? styles?.fieldError : null,
          disabled === true ? tokenStyles.fieldDisabled : null,
          disabled === true ? styles?.fieldDisabled : null,
        ]}
      >
        {hasPrefix ? (
          <View style={[tokenStyles.prefix, styles?.prefix]}>{prefix}</View>
        ) : null}
        <TextInput
          {...rest}
          accessibilityLabel={resolveAccessibilityLabel(label, accessibilityLabel)}
          accessibilityState={{
            ...accessibilityState,
            busy: loading === true,
            disabled: disabled === true,
            invalid: isError,
          } as InputAccessibilityState}
          editable={isEditable}
          multiline={false}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={token.colorTextPlaceholder}
          style={[
            tokenStyles.input,
            styles?.input,
            disabled === true ? tokenStyles.inputDisabled : null,
          ]}
          value={mergedValue}
        />
        {shouldShowClearButton ? (
          <Pressable
            accessibilityLabel={CLEAR_BUTTON_LABEL}
            accessibilityRole="button"
            onPress={handleClear}
            style={({ pressed }) => [
              tokenStyles.clearButton,
              pressed ? tokenStyles.clearButtonPressed : null,
              styles?.clearButton,
            ]}
          >
            <Text style={tokenStyles.clearButtonLabel}>×</Text>
          </Pressable>
        ) : loading === true ? (
          <ActivityIndicator
            accessibilityElementsHidden
            color={token.colorTextTertiary}
            style={tokenStyles.loading}
          />
        ) : hasSuffix ? (
          <View style={[tokenStyles.suffix, styles?.suffix]}>{suffix}</View>
        ) : null}
      </View>
      {message !== undefined && message !== null ? (
        <Text
          style={[
            isError ? tokenStyles.error : tokenStyles.helper,
            isError ? styles?.error : styles?.helper,
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
