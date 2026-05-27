import React from 'react';
import { Button } from '../Button';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

interface PickerHeaderButtonProps {
  content?: ReactNode;
  text?: string;
  testID: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function PickerHeaderButton({
  content,
  disabled,
  onPress,
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
      style={style}
      styles={{ content: textStyle }}
      testID={testID}
      type="text"
    >
      {content !== undefined ? content : <Text style={textStyle}>{text}</Text>}
    </Button>
  );
}
