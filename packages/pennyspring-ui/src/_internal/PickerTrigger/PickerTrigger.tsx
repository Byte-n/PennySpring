import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { DisplayInput } from '../../DisplayInput';
import { Icon } from '../../Icon';
import { useStyles } from './style';
import type { PickerTriggerProps } from './types';
import type { TriggerFieldStyles } from '../../shares/pickerStyles';

/**
 * 清除按钮点击后，部分平台仍会向上冒泡触发父 Pressable。
 * 只拦截同一次点击，跨帧复位，避免吞掉下一次真实点击。
 */
const CLEAR_GUARD_RESET_DELAY = 0;

export function PickerTrigger({
  active,
  allowClear,
  children,
  disabled,
  displayInputProps,
  externalInputStyles,
  externalTriggerStyle,
  hasValue,
  label,
  onClearPress,
  onPress,
  overflow,
  placeholder,
  prefix,
  readonly,
  size,
  status,
  suffix,
  valueText,
}: PickerTriggerProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const skipNextTriggerPressRef = React.useRef(false);
  const isDisabled = disabled === true;
  const isReadonly = readonly === true;
  const externalSuffix = displayInputProps?.suffix;
  const shouldShowClearButton =
    allowClear === true &&
    hasValue === true &&
    !isDisabled &&
    !isReadonly &&
    externalSuffix === undefined;
  const { root: externalInputRootStyle, ...externalInputSlotStyles } =
    externalInputStyles ?? {};

  function handleTriggerPress(): void {
    if (skipNextTriggerPressRef.current) {
      skipNextTriggerPressRef.current = false;
      return;
    }

    onPress?.();
  }

  function handleClearPress(): void {
    skipNextTriggerPressRef.current = true;
    onClearPress?.();
    setTimeout(() => {
      skipNextTriggerPressRef.current = false;
    }, CLEAR_GUARD_RESET_DELAY);
  }

  function renderClearButton(): React.ReactNode {
    return (
      <Pressable
        hitSlop={token.paddingXS}
        onPress={handleClearPress}
        style={({ pressed }) => [
          styles.clearButton,
          pressed ? styles.clearButtonPressed : null,
        ]}
        testID="picker-trigger-clear-button"
      >
        <Icon color="icon" icon="close" size="small" />
      </Pressable>
    );
  }

  const resolvedSuffix =
    externalSuffix !== undefined
      ? externalSuffix
      : shouldShowClearButton
        ? renderClearButton()
        : suffix;
  const resolvedUnderline: TriggerFieldStyles['underline'] =
    active === true
      ? [styles.underlineActive, externalInputSlotStyles.underline]
      : externalInputSlotStyles.underline;
  const resolvedInputStyles: TriggerFieldStyles = {
    ...externalInputSlotStyles,
    underline: resolvedUnderline,
  };
  const resolvedTriggerStyle =
    externalInputRootStyle === undefined
      ? externalTriggerStyle
      : [externalInputRootStyle, externalTriggerStyle];

  return (
    <DisplayInput
      {...displayInputProps}
      disabled={disabled}
      label={label}
      onPress={handleTriggerPress}
      overflow={displayInputProps?.overflow ?? overflow}
      placeholder={placeholder}
      prefix={displayInputProps?.prefix ?? prefix}
      readonly={readonly}
      size={size}
      status={status}
      style={resolvedTriggerStyle}
      styles={resolvedInputStyles}
      suffix={resolvedSuffix}
      valueText={valueText}
    >
      {children}
    </DisplayInput>
  );
}
