import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
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
import { Text, TextSize } from '../Text';
import { isPrimitiveContent, renderTextNode } from '../shares/node';
import { SIZE_MAP, useStyles } from './style';
import type { ComponentSize } from '../shares/types';
import type { InputStatus } from '../Input';
import type {
  DisplayInputDisplay,
  DisplayInputOverflow,
  DisplayInputProps,
} from './types';
import { SIZE_MAP as TEXT_SIZE_MAP } from '../Text/style';
const REQUIRED_MARK = '*';
const AnimatedText = createAnimatedComponent(Text);
const AnimatedView = createAnimatedComponent(View);

function size2BodyTextSize(size: ComponentSize): TextSize {
  return size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';
}

function size2LabelActiveTextSize(size: ComponentSize): TextSize {
  return size === 'small' ? 'xs' : size === 'large' ? 'md' : 'sm';
}

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

function resolveStatus(status?: InputStatus): InputStatus {
  return status ?? 'default';
}

function resolveDisplay(display?: DisplayInputDisplay): DisplayInputDisplay {
  return display ?? 'block';
}

function resolveOverflow(
  overflow?: DisplayInputOverflow,
): DisplayInputOverflow {
  return overflow ?? 'hidden';
}

function isTextLikeValue(value: React.ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

export function DisplayInput({
  disabled,
  display,
  error,
  errorText,
  helper,
  helperText,
  label,
  labelText,
  onPress,
  prefix,
  readonly,
  required,
  size,
  status,
  overflow,
  style,
  styles,
  suffix,
  valueText,
  children,
}: DisplayInputProps) {
  const resolvedSize = resolveSize(size);
  const resolvedStatus = resolveStatus(status);
  const resolvedDisplay = resolveDisplay(display);
  const resolvedOverflow = resolveOverflow(overflow);
  const { token } = useTheme();
  const isDisabled = disabled === true;
  const isReadonly = readonly === true;
  const isClickable = !isDisabled && !isReadonly && onPress !== undefined;
  const hasPrefix = prefix !== undefined && prefix !== null;
  const hasSuffix = suffix !== undefined && suffix !== null;
  const hasCustomValue = children !== undefined && children !== null;
  const hasTextValue = valueText !== undefined && valueText !== '';
  const textValue = hasCustomValue
    ? isTextLikeValue(children)
      ? String(children)
      : undefined
    : hasTextValue
    ? valueText
    : undefined;
  const hasDisplayValue = hasCustomValue || hasTextValue;
  const errorMessage = error !== undefined ? error : errorText;
  const helperMessage = helper !== undefined ? helper : helperText;
  const isError =
    resolvedStatus === 'error' ||
    (errorMessage !== undefined && errorMessage !== null);
  const message =
    isError && errorMessage !== undefined ? errorMessage : helperMessage;
  const tokenStyles = useStyles({
    disabled: isDisabled,
    display: resolvedDisplay,
    isError,
    size: resolvedSize,
  });
  const labelNode = label === null ? null : label ?? labelText ?? null;
  const hasFloatingLabel = labelNode !== null && labelNode !== undefined;
  const isFloatingLabelActive = hasFloatingLabel && hasDisplayValue;
  const progress = useSharedValue(isFloatingLabelActive ? 1 : 0);
  const bodyTextMapFun = TEXT_SIZE_MAP[size2BodyTextSize(resolvedSize)];
  const bodyFontSize = bodyTextMapFun.fontSize(token);
  const labelTextMapFun = TEXT_SIZE_MAP[size2LabelActiveTextSize(resolvedSize)];
  const labelFontSize = labelTextMapFun.fontSize(token);
  const labelLineHeight = labelTextMapFun.lineHeight(token);

  const controlHeight = SIZE_MAP[resolvedSize].minHeight(token);
  const inactiveLabelTop = controlHeight / 2 - labelLineHeight / 2;
  const activeLabelTop = 0;

  useEffect(() => {
    progress.value = withTiming(isFloatingLabelActive ? 1 : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [
    isFloatingLabelActive,
    progress,
    token.motionDurationMid,
    token.motionEaseInOut,
  ]);

  const labelPositionAnimatedStyle = useAnimatedStyle(() => ({
    top: interpolate(
      progress.value,
      [0, 1],
      [inactiveLabelTop, activeLabelTop],
    ),
  }));

  const labelTextAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      progress.value,
      [0, 1],
      [bodyFontSize, labelFontSize],
    ),
    lineHeight: labelLineHeight,
  }));

  const labelContent =
    required === true && typeof labelNode === 'string'
      ? `${labelNode} ${REQUIRED_MARK}`
      : labelNode;
  const isTextLabel = isPrimitiveContent(labelContent);

  return (
    <Column style={[tokenStyles.root, style]}>
      <Pressable
        disabled={!isClickable}
        onPress={onPress}
        style={({ pressed }) => [
          tokenStyles.field,
          styles?.field,
          isDisabled ? tokenStyles.fieldDisabled : null,
          isClickable && pressed ? tokenStyles.fieldPressed : null,
        ]}
      >
        <View
          pointerEvents="none"
          style={[tokenStyles.underline, styles?.underline]}
          testID="display-input-underline"
        />
        {hasPrefix ? (
          <Row style={[tokenStyles.prefix, styles?.prefix]}>
            {renderTextNode(prefix, text => (
              <Text>{text}</Text>
            ))}
          </Row>
        ) : null}
        <View style={tokenStyles.valueWrapper}>
          {hasFloatingLabel && isTextLabel ? (
            <>
              <Text
                numberOfLines={1}
                style={[
                  tokenStyles.labelWidthPlaceholder,
                  { fontSize: bodyFontSize, lineHeight: labelLineHeight },
                ]}
              >
                {labelContent}
              </Text>
              <AnimatedText
                color={isError ? undefined : 'placeholder'}
                numberOfLines={1}
                style={[
                  tokenStyles.floatingLabelContainer,
                  tokenStyles.floatingLabel,
                  styles?.label,
                  labelPositionAnimatedStyle,
                  labelTextAnimatedStyle,
                ]}
                testID="display-input-floating-label"
              >
                {labelContent}
              </AnimatedText>
            </>
          ) : hasFloatingLabel ? (
            <>
              <View style={[tokenStyles.labelWidthPlaceholder]}>
                {labelContent}
              </View>
              <AnimatedView
                style={[
                  tokenStyles.floatingLabelContainer,
                  labelPositionAnimatedStyle,
                ]}
                testID="display-input-floating-label"
              >
                {labelContent}
              </AnimatedView>
            </>
          ) : null}
          {hasCustomValue && !isTextLikeValue(children) ? (
            <Column
              style={[
                tokenStyles.valueContainer,
                hasFloatingLabel
                  ? tokenStyles.valueWithLabel
                  : tokenStyles.valueWithoutLabel,
                resolvedOverflow === 'hidden'
                  ? tokenStyles.valueContainerHidden
                  : tokenStyles.valueContainerVisible,
                styles?.valueContainer,
              ]}
            >
              {children}
            </Column>
          ) : textValue !== undefined ? (
            <Text
              color={isDisabled ? 'disabled' : 'default'}
              size={size2BodyTextSize(resolvedSize)}
              ellipsizeMode={resolvedOverflow === 'hidden' ? 'tail' : undefined}
              numberOfLines={resolvedOverflow === 'hidden' ? 1 : undefined}
              style={[
                tokenStyles.value,
                hasFloatingLabel
                  ? tokenStyles.valueWithLabel
                  : tokenStyles.valueWithoutLabel,
                styles?.value,
                isDisabled ? tokenStyles.valueDisabled : null,
              ]}
            >
              {textValue}
            </Text>
          ) : null}
        </View>
        {hasSuffix ? (
          <Row style={[tokenStyles.suffix, styles?.suffix]}>
            {renderTextNode(suffix, text => (
              <Text>{text}</Text>
            ))}
          </Row>
        ) : null}
      </Pressable>
      {message !== undefined && message !== null
        ? renderTextNode(message, text => (
            <Text
              color={isError ? 'error' : 'description'}
              style={[
                isError ? tokenStyles.error : tokenStyles.helper,
                isError ? styles?.error : styles?.helper,
              ]}
            >
              {text}
            </Text>
          ))
        : null}
    </Column>
  );
}
