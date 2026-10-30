import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import {
  Easing,
  createAnimatedComponent,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { FIELD_SIZE_MAP } from '../shares/fieldMetrics';
import { isPrimitiveContent } from '../shares/node';
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
  getContentTop,
  getFieldHeight,
  resolveMaxRows,
  resolveRows,
  SIZE_CONFIG,
  useStyles,
} from './style';
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';

const AnimatedText = createAnimatedComponent(Text);
const AnimatedView = createAnimatedComponent(View);

/** 计数超过该比例时转警示色。 */
const COUNT_WARNING_RATIO = 0.84;

export function Textarea(rawProps: TextareaProps) {
  const {
    defaultValue,
    disabled,
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
    readonly,
    showCount = false,
    size = 'normal',
    status,
    style,
    styles,
    value,
    ...rest
  } = rawProps;
  const field = useFieldProps<
    string,
    Parameters<NonNullable<TextInputProps['onBlur']>>[0]
  >({
    value,
    onChange: onChangeText,
    onBlur,
    label,
    labelText,
    disabled,
    readonly,
    status,
  });
  const { token } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [mergedValue = '', setMergedValue] = useControllableValue(
    defaultValue ?? '',
    field.value,
    field.onChange,
  );
  const resolvedMinRows = resolveRows(minRows, DEFAULT_MIN_ROWS);
  const resolvedMaxRows = resolveMaxRows(resolvedMinRows, maxRows);
  const textValue = String(mergedValue);
  const isDisabled = field.disabled === true;
  const isReadonly = field.readonly === true;
  const resolvedStatus = field.status ?? 'default';
  const isEditable = !isDisabled && !isReadonly;
  const isIndicatorVisible =
    !isDisabled && (isFocused || resolvedStatus !== 'default');
  const resolvedLabel =
    field.label !== undefined ? field.label : field.labelText;
  const hasFloatingLabel =
    resolvedLabel !== undefined && resolvedLabel !== null;
  const labelContent = resolvedLabel;
  const isTextLabel = isPrimitiveContent(labelContent);
  const isFloated = isFocused || textValue.length > 0;
  const placeholderTextColor =
    hasFloatingLabel && !isFocused
      ? 'transparent'
      : token.colorTextPlaceholder;
  const tokenStyles = useStyles({
    contentHeight,
    hasLabel: hasFloatingLabel,
    isDisabled,
    maxRows: resolvedMaxRows,
    minRows: resolvedMinRows,
    size,
    status: resolvedStatus,
  });
  const metrics = FIELD_SIZE_MAP[size];
  const bodyFontSize = SIZE_CONFIG[size].fontSize(token);
  const bodyLineHeight = SIZE_CONFIG[size].lineHeight(token);
  const labelFontSize = metrics.labelFontSize(token);
  const labelLineHeight = metrics.labelLineHeight(token);
  const restLabelTop = getContentTop(size, token, hasFloatingLabel);
  const activeLabelTop = metrics.labelTop;
  const labelProgress = useSharedValue(isFloated ? 1 : 0);
  const indicatorProgress = useSharedValue(0);

  useEffect(() => {
    labelProgress.value = withTiming(isFloated ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [isFloated, labelProgress, token.motionDurationMid, token.motionEaseInOut]);

  useEffect(() => {
    indicatorProgress.value = withTiming(isIndicatorVisible ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [
    indicatorProgress,
    isIndicatorVisible,
    token.motionDurationMid,
    token.motionEaseInOut,
  ]);

  const labelPositionAnimatedStyle = useAnimatedStyle(() => ({
    top: interpolate(
      labelProgress.value,
      [0, 1],
      [restLabelTop, activeLabelTop],
    ),
  }));
  const labelTextAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      labelProgress.value,
      [0, 1],
      [bodyFontSize, labelFontSize],
    ),
    lineHeight: interpolate(
      labelProgress.value,
      [0, 1],
      [bodyLineHeight, labelLineHeight],
    ),
  }));
  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: indicatorProgress.value }],
  }));

  function handleFocus(
    event: Parameters<NonNullable<TextInputProps['onFocus']>>[0],
  ): void {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(
    event: Parameters<NonNullable<TextInputProps['onBlur']>>[0],
  ): void {
    setIsFocused(false);
    field.onBlur?.(event);
  }

  function handleChangeText(text: string): void {
    setMergedValue(text);
  }

  function handleContentSizeChange(
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ): void {
    const minHeight = getFieldHeight(
      resolvedMinRows,
      size,
      token,
      hasFloatingLabel,
    );
    const maxHeight = getFieldHeight(
      resolvedMaxRows,
      size,
      token,
      hasFloatingLabel,
    );

    setContentHeight(
      clampHeight(event.nativeEvent.contentSize.height, minHeight, maxHeight),
    );
    onContentSizeChange?.(event);
  }

  const countText =
    maxLength === undefined
      ? `${textValue.length}`
      : `${textValue.length} / ${maxLength}`;
  const isCountWarning =
    maxLength !== undefined &&
    maxLength > 0 &&
    textValue.length / maxLength >= COUNT_WARNING_RATIO;

  return (
    <Column style={[tokenStyles.root, style]}>
      <View
        style={[
          tokenStyles.field,
          hasFloatingLabel ? tokenStyles.fieldWithLabel : null,
          styles?.field,
        ]}
      >
        {hasFloatingLabel ? (
          <AnimatedView
            pointerEvents="none"
            style={[tokenStyles.labelContainer, labelPositionAnimatedStyle]}
            testID="textarea-floating-label"
          >
            {isTextLabel ? (
              <AnimatedText
                style={[
                  tokenStyles.label,
                  isFocused
                    ? tokenStyles.labelActive
                    : isFloated
                    ? tokenStyles.labelFilled
                    : null,
                  styles?.label,
                  labelTextAnimatedStyle,
                ]}
              >
                {labelContent}
              </AnimatedText>
            ) : (
              labelContent
            )}
          </AnimatedView>
        ) : null}
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
          placeholderTextColor={placeholderTextColor}
          style={[
            tokenStyles.input,
            isReadonly ? tokenStyles.inputReadonly : null,
            styles?.input,
          ]}
          value={textValue}
        />
        <AnimatedView
          style={[tokenStyles.indicator, indicatorAnimatedStyle]}
        />
      </View>

      {showCount || loading ? (
        <Row style={[tokenStyles.footer, styles?.footer]}>
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
