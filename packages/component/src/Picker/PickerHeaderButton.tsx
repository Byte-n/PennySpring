import React from 'react';
import { Pressable } from 'react-native';
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
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={style}
      testID={testID}
    >
      {content ?? <Text style={textStyle}>{text}</Text>}
    </Pressable>
  );
}
