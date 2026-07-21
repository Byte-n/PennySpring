import React from 'react';
import { Button } from '../Button';
import type { ButtonColor } from '../Button';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

interface PickerHeaderButtonProps {
  content?: ReactNode;
  text?: string;
  testID: string;
  color?: ButtonColor;
  disabled?: boolean;
  onPress?: () => void;
  size?: ComponentSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  danger?: boolean;
}

export function PickerHeaderButton({
  content,
  color,
  disabled,
  onPress,
  size,
  style,
  testID,
  text,
  textStyle,
  danger,
}: PickerHeaderButtonProps) {
  if (content === null) {
    return null;
  }

  if (content === undefined && text === undefined) {
    return null;
  }

  return (
    <Button
      color={color}
      disabled={disabled}
      onPress={onPress}
      size={size}
      style={style}
      styles={{ content: textStyle }}
      testID={testID}
      type="text"
      danger={danger}
    >
      {content !== undefined ? content : text}
    </Button>
  );
}
