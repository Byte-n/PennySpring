import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Text } from '../Text';
import { PickerColumn } from './PickerColumn';
import { usePickerWheelStyles } from './usePickerWheelStyles';
import type { ReactNode } from 'react';
import type {
  PickerBodyStyles,
  PickerColumn as PickerColumnData,
  PickerColumnItemData,
  PickerItemValue,
  PickerPopupProps,
} from './types';

interface PickerViewProps<TItem extends PickerColumnItemData> {
  columns: Array<PickerColumnData<TItem>>;
  empty?: ReactNode;
  emptyText?: string;
  renderLabel?: PickerPopupProps<TItem>['renderLabel'];
  selectedValue: Array<PickerItemValue<TItem>>;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerBodyStyles;
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
  wheelHeight: number;
}

export function PickerView<TItem extends PickerColumnItemData>({
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
  wheelHeight,
}: PickerViewProps<TItem>) {
  const viewStyles = slotStyles?.view;
  const itemStyle = StyleSheet.flatten(styles.item);
  const itemHeight = typeof itemStyle?.minHeight === 'number'
    ? itemStyle.minHeight
    : 0;
  const wheelStyles = usePickerWheelStyles({
    itemHeight,
    wheelHeight,
  });
  const hasUnselectedValue = columns.length > 0 && columns.every((column, columnIndex) =>
    column.findIndex(item => item.value === selectedValue[columnIndex]) < 0,
  );

  return (
    <View style={styles.view}>
      <View
        pointerEvents="none"
        style={[
          styles.indicator,
          wheelHeight > 0 ? wheelStyles.indicator : undefined,
          hasUnselectedValue ? wheelStyles.indicatorUnselected : undefined,
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
            wheelHeight={wheelHeight}
          />
        )
      ))}
    </View>
  );
}
