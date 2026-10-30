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
import { Text } from '../Text';
import { FIELD_SIZE_MAP, resolveFieldSize } from '../shares/fieldMetrics';
import { isPrimitiveContent, renderTextNode } from '../shares/node';
import { useStyles } from './style';
import type { InputStatus } from '../Input';
import type {
  DisplayInputDisplay,
  DisplayInputOverflow,
  DisplayInputProps,
} from './types';
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';
const AnimatedText = createAnimatedComponent(Text);
const AnimatedView = createAnimatedComponent(View);

function resolveStatus(status?: InputStatus): InputStatus {
  return status ?? 'default';
}

function resolveDisplay(display?: DisplayInputDisplay): DisplayInputDisplay {
  return display ?? 'inline';
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
  label,
  labelText,
  onPress,
  placeholder,
  prefix,
  readonly,
  size,
  status,
  overflow,
  style,
  styles,
  suffix,
  valueText,
  children,
}: DisplayInputProps) {
  const field = useFieldProps({
    label,
    labelText,
    status,
    disabled,
    readonly,
  });
  const resolvedSize = resolveFieldSize(size);
  const resolvedStatus = resolveStatus(field.status);
  const resolvedDisplay = resolveDisplay(display);
  const resolvedOverflow = resolveOverflow(overflow);
  const { token } = useTheme();
  const isDisabled = field.disabled === true;
  const isReadonly = field.readonly === true;
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
  const isError = resolvedStatus === 'error';
  const labelNode =
    field.label === null ? null : field.label ?? field.labelText ?? null;
  const hasFloatingLabel = labelNode !== null && labelNode !== undefined;
  const shouldRenderPlaceholder = !hasFloatingLabel
    && !hasDisplayValue
    && placeholder !== undefined
    && placeholder !== '';
  const tokenStyles = useStyles({
    disabled: isDisabled,
    display: resolvedDisplay,
    hasLabel: hasFloatingLabel,
    isError,
    size: resolvedSize,
  });
  const isFloatingLabelActive = hasFloatingLabel && hasDisplayValue;
  const progress = useSharedValue(isFloatingLabelActive ? 1 : 0);
  const metrics = FIELD_SIZE_MAP[resolvedSize];
  const bodyFontSize = metrics.valueFontSize(token);
  const bodyLineHeight = metrics.valueLineHeight(token);
  const labelFontSize = metrics.labelFontSize(token);
  const labelLineHeight = metrics.labelLineHeight(token);
  const labelOffsetX = metrics.labelOffsetX(token);
  const controlHeight = metrics.height(token);
  const inactiveLabelTop = controlHeight / 2 - bodyLineHeight / 2;
  // 与 Input 一致：激活态标签收起字号并向控件左上角收拢
  const activeLabelTop = metrics.labelTop;

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
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, -labelOffsetX]),
      },
    ],
  }));

  const labelTextAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      progress.value,
      [0, 1],
      [bodyFontSize, labelFontSize],
    ),
    lineHeight: interpolate(
      progress.value,
      [0, 1],
      [bodyLineHeight, labelLineHeight],
    ),
  }));

  const labelContent = labelNode;
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
        testID="display-input-field"
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
                style={[tokenStyles.labelWidthPlaceholder]}
              >
                {labelContent}
              </Text>
              <AnimatedText
                numberOfLines={1}
                style={[
                  tokenStyles.floatingLabelContainer,
                  tokenStyles.floatingLabel,
                  isFloatingLabelActive
                    ? tokenStyles.floatingLabelActive
                    : null,
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
              ellipsizeMode={resolvedOverflow === 'hidden' ? 'tail' : undefined}
              numberOfLines={resolvedOverflow === 'hidden' ? 1 : undefined}
              style={[
                tokenStyles.value,
                styles?.value,
              ]}
            >
              {textValue}
            </Text>
          ) : shouldRenderPlaceholder ? (
            <Text
              color="placeholder"
              ellipsizeMode={resolvedOverflow === 'hidden' ? 'tail' : undefined}
              numberOfLines={resolvedOverflow === 'hidden' ? 1 : undefined}
              style={tokenStyles.value}
            >
              {placeholder}
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
    </Column>
  );
}
