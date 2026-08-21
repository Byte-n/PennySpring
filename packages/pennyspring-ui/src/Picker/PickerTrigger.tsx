import React from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { DisplayInput } from '../DisplayInput';
import { Icon } from '../Icon';
import type { ReactNode } from 'react';
import type { ComponentSize } from '../shares/types';
import type { PickerInputStyles, PickerProps } from './types';

interface PickerTriggerProps {
  allowClear?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  externalInputStyles?: PickerInputStyles;
  externalTriggerStyle?: StyleProp<ViewStyle>;
  hasValue?: boolean;
  label?: PickerProps['label'];
  readonly?: boolean;
  size?: ComponentSize;
  valueText?: string;
  displayInputProps?: PickerProps['displayInputProps'];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  onPress?: () => void;
  onClearPress?: () => void;
}

export function PickerTrigger({
  allowClear,
  children,
  displayInputProps,
  disabled,
  externalInputStyles,
  externalTriggerStyle,
  hasValue,
  label,
  onPress,
  onClearPress,
  readonly,
  size,
  styles,
  valueText,
}: PickerTriggerProps) {
  const { token } = useTheme();
  const skipNextTriggerPressRef = React.useRef(false);
  const displayInputSuffix = displayInputProps?.suffix;
  const {
    root: externalInputRootStyle,
    ...externalInputSlotStyles
  } = externalInputStyles ?? {};
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
    <DisplayInput
      disabled={disabled}
      readonly={readonly}
      size={size}
      valueText={valueText}
      label={label}
      onPress={handleTriggerPress}
      style={[externalInputRootStyle, externalTriggerStyle]}
      styles={externalInputSlotStyles}
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
          <Icon color="icon" icon="close" size="small" />
        </Pressable>
      ) : undefined}
      {...displayInputProps}
    >
      {children}
    </DisplayInput>
  );
}
