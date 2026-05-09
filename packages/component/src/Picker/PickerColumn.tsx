import React from 'react';
import { View } from 'react-native';
import { PickerColumnItem } from './PickerColumnItem';
import type { PickerColumn as PickerColumnData, PickerProps, PickerValue } from './types';

interface PickerColumnProps {
  column: PickerColumnData;
  columnIndex: number;
  renderLabel?: PickerProps['renderLabel'];
  selectedValue?: PickerValue;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerProps['styles'];
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
}

export function PickerColumn({
  column,
  columnIndex,
  onItemPress,
  renderLabel,
  selectedValue,
  slotStyles,
  styles,
}: PickerColumnProps) {
  return (
    <View style={[styles.column, slotStyles?.column]}>
      {column.map((item, itemIndex) => (
        <PickerColumnItem
          columnIndex={columnIndex}
          item={item}
          itemIndex={itemIndex}
          key={`${item.value}-${itemIndex}`}
          onPress={() => onItemPress?.(columnIndex, itemIndex)}
          renderLabel={renderLabel}
          selected={item.value === selectedValue}
          slotStyles={slotStyles}
          styles={styles}
        />
      ))}
    </View>
  );
}
