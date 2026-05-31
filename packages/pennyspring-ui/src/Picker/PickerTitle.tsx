import React from 'react';
import { Column } from '../Column';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
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
    <Column style={[styles.titleContainer, slotStyles?.titleContainer]}>
      {renderTextNode(title !== undefined ? title : titleText, (text) => (
        <Text color="heading" style={[styles.titleText, slotStyles?.titleText]}>
          {text}
        </Text>
      ))}
    </Column>
  );
}
