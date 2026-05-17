import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { DisplayInput } from '../DisplayInput';
import { Icon } from '../Icon';
import type { ReactNode } from 'react';
import type { PickerProps } from './types';

interface PickerTriggerProps {
  allowClear?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  hasValue?: boolean;
  label?: PickerProps['label'];
  valueText?: string;
  placeholder?: string;
  displayInputProps?: PickerProps['displayInputProps'];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  triggerStyle?: PickerProps['triggerStyle'];
  onPress?: () => void;
  onClearPress?: () => void;
}

export function PickerTrigger({
  allowClear,
  children,
  displayInputProps,
  disabled,
  hasValue,
  label,
  onPress,
  onClearPress,
  placeholder,
  styles,
  triggerStyle,
  valueText,
}: PickerTriggerProps) {
  const { token } = useTheme();
  const skipNextTriggerPressRef = React.useRef(false);
  const displayInputSuffix = displayInputProps?.suffix;
  const shouldShowClearButton = allowClear === true
    && hasValue === true
    && disabled !== true
    && displayInputSuffix === undefined;

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
  }

  return (
    <Pressable
      disabled={disabled}
      onPress={handleTriggerPress}
      style={[styles.trigger, triggerStyle]}
      testID="picker-trigger"
    >
      <DisplayInput
        disabled={disabled}
        display="inline"
        valueText={valueText}
        placeholder={placeholder}
        readonly
        label={label}
        suffix={shouldShowClearButton ? (
          <Pressable
            hitSlop={token.paddingXS}
            onPress={handleClearPress}
            style={({ pressed }) => [
              styles.triggerClearButton,
              pressed ? styles.triggerClearButtonPressed : null,
            ]}
            testID="picker-trigger-clear-button"
          >
            <Icon color="colorIcon" icon="close" size="small" />
          </Pressable>
        ) : undefined}
        {...displayInputProps}
      >
        {children}
      </DisplayInput>
    </Pressable>
  );
}
