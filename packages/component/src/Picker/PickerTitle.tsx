import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import type { PickerHeaderStyles, PickerProps } from './types';

interface PickerTitleProps {
  title?: PickerProps['title'];
  titleText?: PickerProps['titleText'];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerHeaderStyles;
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
