import React from 'react';
import { Pressable } from 'react-native';
import { Input } from '../Input';
import type { ReactNode } from 'react';
import type { PickerProps } from './types';

interface PickerTriggerProps {
  children?: ReactNode;
  disabled?: boolean;
  placeholder?: string;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerProps['styles'];
  onPress?: () => void;
}

export function PickerTrigger({
  children,
  disabled,
  onPress,
  placeholder,
  slotStyles,
  styles,
}: PickerTriggerProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.trigger, slotStyles?.trigger]}
      testID="picker-trigger"
    >
      {children ?? (
        <Input
          disabled={disabled}
          placeholder={placeholder}
          readonly
          testID="picker-trigger-input"
          showSoftInputOnFocus={false}
        />
      )}
    </Pressable>
  );
}
