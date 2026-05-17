import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { PickerColumn } from './PickerColumn';
import type { ReactNode } from 'react';
import type { PickerBodyStyles, PickerColumn as PickerColumnData, PickerPopupProps, PickerValue } from './types';

interface PickerViewProps {
  columns: PickerColumnData[];
  empty?: ReactNode;
  emptyText?: string;
  renderLabel?: PickerPopupProps['renderLabel'];
  selectedValue: PickerValue[];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerBodyStyles;
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerView({
  columns,
  empty,
  emptyText,
  hasDisabledFocusedItem,
  isWheelScrolling,
  onFocusIndexChange,
  onItemPress,
  onWheelScrollStateChange,
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
        style={[
          styles.indicator,
          hasDisabledFocusedItem && !isWheelScrolling ? styles.indicatorError : undefined,
          viewStyles?.indicator,
        ]}
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
            onFocusIndexChange={onFocusIndexChange}
            onItemPress={onItemPress}
            onWheelScrollStateChange={onWheelScrollStateChange}
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
