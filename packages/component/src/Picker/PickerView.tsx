import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { PickerColumn } from './PickerColumn';
import type { ReactNode } from 'react';
import type { PickerBodyStyles, PickerProps, PickerValue } from './types';

interface PickerViewProps {
  columns: PickerProps['columns'];
  empty?: ReactNode;
  emptyText?: string;
  renderLabel?: PickerProps['renderLabel'];
  selectedValue: PickerValue[];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerBodyStyles;
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
  const viewStyles = slotStyles?.view;

  return (
    <View style={styles.view}>
      <View
        pointerEvents="none"
        style={[styles.indicator, viewStyles?.indicator]}
        testID="picker-indicator"
      />
      {columns.map((column, columnIndex) => (
        column.length === 0 ? (
          <View
            key={columnIndex}
            style={[styles.column, styles.empty, viewStyles?.column?.column, slotStyles?.empty]}
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
            slotStyles={slotStyles?.view?.column}
            styles={styles}
          />
        )
      ))}
    </View>
  );
}
