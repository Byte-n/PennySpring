import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../Text';
import { useStyles } from './style';
import type { ComponentSize } from '../shares/types';
import type { InputStatus } from '../Input';
import type {
  DisplayInputDisplay,
  DisplayInputProps,
  DisplayInputTextOverflow,
} from './types';

const REQUIRED_MARK = '*';

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

function resolveStatus(status?: InputStatus): InputStatus {
  return status ?? 'default';
}

function resolveDisplay(display?: DisplayInputDisplay): DisplayInputDisplay {
  return display ?? 'block';
}

function resolveTextOverflow(
  textOverflow?: DisplayInputTextOverflow,
): DisplayInputTextOverflow {
  return textOverflow ?? 'ellipsis';
}

function resolveAccessibilityLabel(
  label: DisplayInputProps['label'],
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

function isTextLikeValue(value: React.ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

export function DisplayInput({
  accessibilityLabel,
  disabled,
  display,
  errorText,
  helperText,
  label,
  onPress,
  placeholder,
  prefix,
  readonly,
  required,
  size,
  status,
  textOverflow,
  style,
  styles,
  suffix,
  valueText,
  value,
}: DisplayInputProps) {
  const resolvedSize = resolveSize(size);
  const resolvedStatus = resolveStatus(status);
  const resolvedDisplay = resolveDisplay(display);
  const resolvedTextOverflow = resolveTextOverflow(textOverflow);
  const tokenStyles = useStyles({
    display: resolvedDisplay,
    size: resolvedSize,
    status: resolvedStatus,
  });

  const isDisabled = disabled === true;
  const isReadonly = readonly === true;
  const isClickable = !isDisabled && !isReadonly && onPress !== undefined;
  const isError = resolvedStatus === 'error';
  const hasLabel = label !== undefined && label !== null;
  const hasPrefix = prefix !== undefined && prefix !== null;
  const hasSuffix = suffix !== undefined && suffix !== null;
  const hasCustomValue = value !== undefined && value !== null;
  const hasTextValue = valueText !== undefined && valueText !== '';
  const textValue = hasCustomValue
    ? isTextLikeValue(value)
      ? String(value)
      : undefined
    : hasTextValue
      ? valueText
      : undefined;
  const hasDisplayText = textValue !== undefined && textValue !== '';
  const message = isError && errorText !== undefined ? errorText : helperText;

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
      <Pressable
        accessibilityLabel={resolveAccessibilityLabel(label, accessibilityLabel)}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled || isReadonly }}
        disabled={!isClickable}
        onPress={onPress}
        style={({ pressed }) => [
          tokenStyles.field,
          styles?.field,
          isDisabled ? tokenStyles.fieldDisabled : null,
          isClickable && pressed ? tokenStyles.fieldPressed : null,
        ]}
      >
        {hasPrefix ? (
          <View style={[tokenStyles.prefix, styles?.prefix]}>{prefix}</View>
        ) : null}
        {hasCustomValue && !isTextLikeValue(value) ? (
          <View style={[tokenStyles.valueContainer, styles?.valueContainer]}>
            {value}
          </View>
        ) : (
          <Text
            ellipsizeMode={resolvedTextOverflow === 'ellipsis' ? 'tail' : undefined}
            numberOfLines={resolvedTextOverflow === 'ellipsis' ? 1 : undefined}
            style={[
              tokenStyles.value,
              styles?.value,
              !hasDisplayText ? tokenStyles.placeholder : null,
              !hasDisplayText ? styles?.placeholder : null,
              isDisabled ? tokenStyles.valueDisabled : null,
            ]}
          >
            {hasDisplayText ? textValue : placeholder}
          </Text>
        )}
        {hasSuffix ? (
          <View style={[tokenStyles.suffix, styles?.suffix]}>{suffix}</View>
        ) : null}
      </Pressable>
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
