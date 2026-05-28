import React from 'react';
import { Button } from '../Button';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

interface PickerHeaderButtonProps {
  content?: ReactNode;
  text?: string;
  testID: string;
  disabled?: boolean;
  onPress?: () => void;
  size?: ComponentSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function PickerHeaderButton({
  content,
  disabled,
  onPress,
  size,
  style,
  testID,
  text,
  textStyle,
}: PickerHeaderButtonProps) {
  if (content === null) {
    return null;
  }

  if (content === undefined && text === undefined) {
    return null;
  }

  return (
    <Button
      disabled={disabled}
      onPress={onPress}
      size={size}
      style={style}
      styles={{ content: textStyle }}
      testID={testID}
      type="text"
    >
      {content !== undefined ? content : <Text style={textStyle}>{text}</Text>}
    </Button>
  );
}
