import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../shares/types';
import type {
  GestureResponderEvent,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
} from 'react-native';
import type {
  InputProps,
  InputSearchProps,
  InputStatus,
} from './types';

interface InputStyleOptions {
  size: ComponentSize;
  status: InputStatus;
}

interface SearchInputStyleOptions {
  size: ComponentSize;
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
const INPUT_ACTION_HIT_SLOP = 8;

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
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

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

function resolveStatus(status?: InputStatus): InputStatus {
  return status ?? 'default';
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
        color: token.colorIcon,
        fontSize: sizeConfig.fontSize(token),
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

const useSearchStyles = createUseSheetStyle(
  (token, { size }: SearchInputStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      searchButton: {
        minHeight: token.controlHeightSM,
        minWidth: token.controlHeightSM,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: token.borderRadiusSM,
      },
      searchButtonPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      searchIcon: {
        color: token.colorTextTertiary,
        fontSize: sizeConfig.fontSize(token),
      },
    };
  },
);

function InputRoot({
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
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    value,
    onChangeText,
  );
  const isEditable = !disabled && !readonly;
  const isError = resolvedStatus === 'error';
  const shouldShowClearButton =
    clearable === true && Boolean(mergedValue) && isEditable && loading !== true;
  const message = isError && errorText !== undefined ? errorText : helperText;
  const hasLabel = label !== undefined && label !== null;
  const hasPrefix = prefix !== undefined && prefix !== null;
  const hasSuffix = suffix !== undefined && suffix !== null;

  function handleClear(): void {
    if (onClear !== undefined) {
      setMergedValue('');
      onClear();
      return;
    }

    setMergedValue('');
  }

  function handleChangeText(text: string): void {
    setMergedValue(text);
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
            <Text style={tokenStyles.requiredMark}>
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
          resolvedStatus === 'warning' ? tokenStyles.fieldWarning : null,
          resolvedStatus === 'success' ? tokenStyles.fieldSuccess : null,
          isError ? tokenStyles.fieldError : null,
          disabled === true ? tokenStyles.fieldDisabled : null,
        ]}
      >
        {hasPrefix ? (
          <View style={[tokenStyles.prefix, styles?.prefix]}>{prefix}</View>
        ) : null}
        <TextInput
          {...rest}
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
            hitSlop={INPUT_ACTION_HIT_SLOP}
            onPress={handleClear}
            style={({ pressed }) => [
              tokenStyles.clearButton,
              pressed ? tokenStyles.clearButtonPressed : null,
              styles?.clearButton,
            ]}
            testID="input-clear-button"
          >
            <Icon
              color="icon"
              icon="close"
              size={tokenStyles.clearButtonLabel.fontSize}
            />
          </Pressable>
        ) : loading === true ? (
          <ActivityIndicator
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

function SearchInput({
  defaultValue,
  disabled,
  loading,
  onClear,
  onChangeText,
  onSearch,
  onSubmitEditing,
  readonly,
  searchIcon,
  size,
  value,
  ...rest
}: InputSearchProps) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useSearchStyles({ size: resolvedSize });
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    value,
    onChangeText,
  );
  const canSearch = !disabled && !readonly && loading !== true;

  function handleChangeText(text: string): void {
    setMergedValue(text);
  }

  function handleClear(): void {
    if (onClear !== undefined) {
      setMergedValue('');
      onClear();
      return;
    }

    setMergedValue('');
  }

  function handleSearch(): void {
    if (!canSearch) {
      return;
    }

    onSearch?.(mergedValue);
  }

  function handleSearchPress(_event: GestureResponderEvent): void {
    handleSearch();
  }

  function handleSubmitEditing(
    event: Parameters<NonNullable<TextInputProps['onSubmitEditing']>>[0],
  ): void {
    handleSearch();
    onSubmitEditing?.(event);
  }

  const resolvedSearchIcon = searchIcon ?? (
    <Icon
      color={canSearch ? 'icon' : 'textDisabled'}
      icon="search"
      size={tokenStyles.searchIcon.fontSize}
    />
  );

  return (
    <InputRoot
      {...rest}
      defaultValue={defaultValue}
      disabled={disabled}
      loading={loading}
      onClear={handleClear}
      onChangeText={handleChangeText}
      onSubmitEditing={handleSubmitEditing}
      readonly={readonly}
      returnKeyType={rest.returnKeyType ?? 'search'}
      size={resolvedSize}
      suffix={
        <Pressable
          disabled={!canSearch}
          onPress={handleSearchPress}
          style={({ pressed }) => [
            tokenStyles.searchButton,
            pressed && canSearch ? tokenStyles.searchButtonPressed : null,
          ]}
          testID="input-search-button"
        >
          {resolvedSearchIcon}
        </Pressable>
      }
      value={mergedValue}
    />
  );
}

export const Input = Object.assign(InputRoot, {
  Search: SearchInput,
});
