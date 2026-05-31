import React, { useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { Row } from '../Row';
import { Spacer } from '../Spacer';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
import { useControllableValue } from '../_hooks';
import type {
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  TextInputProps,
} from 'react-native';
import type {
  TextareaProps,
} from './types';
import {
  clampHeight,
  DEFAULT_MIN_ROWS,
  getFieldHeight,
  resolveMaxRows,
  resolveRows,
  useStyles,
} from './style';

export function Textarea({
  defaultValue,
  disabled = false,
  error,
  errorText,
  helper,
  helperText,
  label,
  labelText,
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
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    value,
    onChangeText,
  );
  const resolvedMinRows = resolveRows(minRows, DEFAULT_MIN_ROWS);
  const resolvedMaxRows = resolveMaxRows(resolvedMinRows, maxRows);
  const textValue = String(mergedValue);
  const isEditable = !disabled && !readonly;
  const isError = status === 'error';
  const errorMessage = error !== undefined ? error : errorText;
  const helperMessage = helper !== undefined ? helper : helperText;
  const message = isError && errorMessage !== undefined
    ? errorMessage
    : helperMessage;
  const shouldShowMessage = message !== undefined && message !== null;
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
    setMergedValue(text);
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

  const labelColor = disabled ? 'disabled' : 'label';
  const resolvedLabel = label !== undefined ? label : labelText;
  const renderLabelContent = () =>
    renderTextNode(resolvedLabel, (text) => (
      <Text size="sm" weight="medium" color={labelColor} style={styles?.label}>
        {text}
      </Text>
    ));

  return (
    <Column style={[tokenStyles.root, style]}>
      {label !== null && (label !== undefined || labelText !== undefined) ? (
        <Row align="center" gap="small">
          {renderLabelContent()}
          {required ? <Text size="sm" color="error">*</Text> : null}
        </Row>
      ) : null}

      <View
        style={[
          tokenStyles.field,
          styles?.field,
          readonly ? tokenStyles.fieldReadonly : null,
          disabled ? tokenStyles.fieldDisabled : null,
          isError ? tokenStyles.fieldError : null,
          isFocused ? tokenStyles.fieldFocused : null,
        ]}
      >
        <TextInput
          {...rest}
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
            color={token.colorPrimary}
            size="small"
            style={tokenStyles.loading}
          />
        ) : null}
      </View>

      {shouldShowMessage || showCount ? (
        <Row justify="between" align="start" style={[tokenStyles.footer, styles?.footer]}>
          {shouldShowMessage ? (
            <Text
              size="sm"
              color={isError && errorMessage !== undefined ? 'errorText' : 'description'}
              style={[
                isError && errorMessage !== undefined
                  ? tokenStyles.error
                  : tokenStyles.helper,
                isError && errorMessage !== undefined
                  ? styles?.error
                  : styles?.helper,
              ]}
            >
              {message}
            </Text>
          ) : (
            <Spacer />
          )}
          {showCount ? (
            <Text size="sm" color="tertiary" style={styles?.count}>{countText}</Text>
          ) : null}
        </Row>
      ) : null}
    </Column>
  );
}
