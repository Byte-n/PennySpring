import React from 'react';
import { Pressable, View } from 'react-native';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { useStyles } from './style';
import type { ComponentSize } from '../shares/types';
import type { InputStatus } from '../Input';
import type {
  DisplayInputDisplay,
  DisplayInputOverflow,
  DisplayInputProps,
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

function resolveOverflow(overflow?: DisplayInputOverflow): DisplayInputOverflow {
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
  placeholder,
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
  const tokenStyles = useStyles({
    display: resolvedDisplay,
    size: resolvedSize,
    status: resolvedStatus,
  });

  const isDisabled = disabled === true;
  const isReadonly = readonly === true;
  const isClickable = !isDisabled && !isReadonly && onPress !== undefined;
  const isError = resolvedStatus === 'error';
  const hasLabelNode = label !== undefined;
  const hasLabelText = labelText !== undefined && labelText !== '';
  const hasLabel = label === null ? false : hasLabelNode || hasLabelText;
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
  const hasDisplayText = textValue !== undefined && textValue !== '';
  const errorMessage = error !== undefined ? error : errorText;
  const helperMessage = helper !== undefined ? helper : helperText;
  const message = isError && errorMessage !== undefined
    ? errorMessage
    : helperMessage;

  const renderLabel = () => {
    if (label === null) {
      return null;
    }

    if (label !== undefined) {
      return label;
    }

    if (hasLabelText) {
      return (
        <Text style={[tokenStyles.label, styles?.label]}>
          {labelText}
        </Text>
      );
    }

    return null;
  };

  return (
    <Column style={[tokenStyles.root, style]}>
      {hasLabel ? (
        <Row align="center" style={tokenStyles.labelRow}>
          {renderLabel()}
          {required === true ? (
            <Text style={tokenStyles.requiredMark}>
              {REQUIRED_MARK}
            </Text>
          ) : null}
        </Row>
      ) : null}
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
        <Row align="center" style={tokenStyles.fieldContent}>
          {hasPrefix ? (
            <View style={[tokenStyles.prefix, styles?.prefix]}>{prefix}</View>
          ) : null}
          {hasCustomValue && !isTextLikeValue(children) ? (
            <View
              style={[
                tokenStyles.valueContainer,
                resolvedOverflow === 'hidden'
                  ? tokenStyles.valueContainerHidden
                  : tokenStyles.valueContainerVisible,
                styles?.valueContainer,
              ]}
            >
              {children}
            </View>
          ) : (
            <Text
              ellipsizeMode={resolvedOverflow === 'hidden' ? 'tail' : undefined}
              numberOfLines={resolvedOverflow === 'hidden' ? 1 : undefined}
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
        </Row>
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
    </Column>
  );
}
