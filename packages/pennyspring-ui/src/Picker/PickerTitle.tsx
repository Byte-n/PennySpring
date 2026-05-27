import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import type { PickerHeaderStyles, PickerPopupProps } from './types';

interface PickerTitleProps {
  title?: PickerPopupProps['title'];
  titleText?: PickerPopupProps['titleText'];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerHeaderStyles;
}

export function PickerTitle({
  title,
  titleText,
  styles,
  slotStyles,
}: PickerTitleProps) {
  if (title === null) {
    return null;
  }

  if (title === undefined && titleText === undefined) {
    return null;
  }

  return (
    <View style={[styles.titleContainer, slotStyles?.titleContainer]}>
      {title !== undefined ? title : (
        <Text style={[styles.titleText, slotStyles?.titleText]}>
          {titleText}
        </Text>
      )}
    </View>
  );
}
