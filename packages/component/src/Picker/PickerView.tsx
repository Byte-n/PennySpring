import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { PickerColumn } from './PickerColumn';
import type { ReactNode } from 'react';
import type { PickerProps, PickerValue } from './types';

interface PickerViewProps {
  columns: PickerProps['columns'];
  empty?: ReactNode;
  emptyText?: string;
  renderLabel?: PickerProps['renderLabel'];
  selectedValue: PickerValue[];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerProps['styles'];
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
}

export function PickerView({
  columns,
  empty,
  emptyText,
  onItemPress,
  renderLabel,
  selectedValue,
  slotStyles,
  styles,
}: PickerViewProps) {
  return (
    <View style={[styles.view, slotStyles?.view]}>
      <View
        pointerEvents="none"
        style={[styles.indicator, slotStyles?.indicator]}
        testID="picker-indicator"
      />
      {columns.map((column, columnIndex) => (
        column.length === 0 ? (
          <View
            key={columnIndex}
            style={[styles.column, styles.empty, slotStyles?.column, slotStyles?.empty]}
          >
            {empty ?? <Text>{emptyText}</Text>}
          </View>
        ) : (
          <PickerColumn
            column={column}
            columnIndex={columnIndex}
            key={columnIndex}
            onItemPress={onItemPress}
            renderLabel={renderLabel}
            selectedValue={selectedValue[columnIndex]}
            slotStyles={slotStyles}
            styles={styles}
          />
        )
      ))}
    </View>
  );
}
