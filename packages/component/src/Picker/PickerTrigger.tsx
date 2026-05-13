import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '../Text';
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
      {children ?? (placeholder ? <Text>{placeholder}</Text> : <Text />)}
    </Pressable>
  );
}
