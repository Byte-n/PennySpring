import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, TextInput, View } from 'react-native';
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
import type { TextareaProps } from './types';
import {
  clampHeight,
  DEFAULT_MIN_ROWS,
  getFieldHeight,
  resolveMaxRows,
  resolveRows,
  SIZE_CONFIG,
  useStyles,
} from './style';

/** 计数超过该比例时转警示色。 */
const COUNT_WARNING_RATIO = 0.84;

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
  const indicator = useRef(new Animated.Value(0)).current;
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
  const isIndicatorVisible = !disabled && (isFocused || status !== 'default');
  const tokenStyles = useStyles({
    contentHeight,
    isDisabled: disabled,
    isFocused,
    maxRows: resolvedMaxRows,
    minRows: resolvedMinRows,
    size,
    status,
  });

  useEffect(() => {
    Animated.timing(indicator, {
      duration: token.motionDurationMid,
      toValue: isIndicatorVisible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [indicator, isIndicatorVisible, token.motionDurationMid]);

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
  const isCountWarning =
    maxLength !== undefined &&
    maxLength > 0 &&
    textValue.length / maxLength >= COUNT_WARNING_RATIO;
  const messageColor = status === 'error'
    ? 'errorText'
    : status === 'warning'
    ? 'warningText'
    : status === 'success'
    ? 'successText'
    : 'tertiary';
  const labelColor = disabled ? 'quaternary' : readonly ? 'secondary' : 'default';
  const resolvedLabel = label !== undefined ? label : labelText;
  const renderLabelContent = () =>
    renderTextNode(resolvedLabel, (text) => (
      <Text
        color={labelColor}
        size={SIZE_CONFIG[size].labelSize}
        style={styles?.label}
        weight="semibold"
      >
        {text}
      </Text>
    ));

  return (
    <Column style={[tokenStyles.root, style]}>
      {label !== null && (label !== undefined || labelText !== undefined) ? (
        <Row align="center" style={tokenStyles.labelRow}>
          {renderLabelContent()}
          {required ? <Text color="error" size={SIZE_CONFIG[size].labelSize}>*</Text> : null}
        </Row>
      ) : null}

      <View style={[tokenStyles.field, styles?.field]}>
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
          style={[
            tokenStyles.input,
            readonly ? tokenStyles.inputReadonly : null,
            styles?.input,
          ]}
          value={textValue}
        />
        <Animated.View
          style={[
            tokenStyles.indicator,
            { transform: [{ scaleX: indicator }] },
          ]}
        />
      </View>

      {shouldShowMessage || showCount || loading ? (
        <Row align="start" justify="between" style={[tokenStyles.footer, styles?.footer]}>
          {shouldShowMessage ? (
            renderTextNode(message, (text) => (
              <Text
                color={messageColor}
                size="xs"
                style={[
                  isError ? tokenStyles.error : tokenStyles.helper,
                  isError ? styles?.error : styles?.helper,
                ]}
              >
                {text}
              </Text>
            ))
          ) : (
            <Spacer />
          )}
          {loading ? (
            <ActivityIndicator
              color={token.colorPrimary}
              size={14}
              style={tokenStyles.loading}
            />
          ) : showCount ? (
            <Text
              color={isCountWarning ? 'warningText' : 'tertiary'}
              size="xs"
              style={[tokenStyles.count, styles?.count]}
            >
              {countText}
            </Text>
          ) : null}
        </Row>
      ) : null}
    </Column>
  );
}
