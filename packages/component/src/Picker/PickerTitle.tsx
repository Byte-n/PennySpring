import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import type { PickerProps } from './types';

interface PickerTitleProps {
  title?: PickerProps['title'];
  titleText?: PickerProps['titleText'];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerProps['styles'];
}

export function PickerTitle({
  title,
  titleText,
  styles,
  slotStyles,
}: PickerTitleProps) {
  return (
    <View style={[styles.titleContainer, slotStyles?.titleContainer]}>
      {title ?? (
        <Text style={[styles.titleText, slotStyles?.titleText]}>
          {titleText}
        </Text>
      )}
    </View>
  );
}
