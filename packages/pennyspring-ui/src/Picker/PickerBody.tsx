import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GeometryReader } from '../GeometryReader';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
import { PickerView } from './PickerView';
import { WHEEL_VISIBLE_ITEM_COUNT } from './usePickerStyles';
import type { ReactNode } from 'react';
import type { ComponentSize } from '../shares/types';
import type {
  PickerBodyStyles,
  PickerColumn,
  PickerColumnItemData,
  PickerItemValue,
  PickerPopupProps,
} from './types';

interface PickerBodyProps<TItem extends PickerColumnItemData> {
  columns: Array<PickerColumn<TItem>>;
  empty?: ReactNode;
  emptyText?: string;
  loading?: boolean;
  loadingIndicator?: ReactNode;
  loadingIndicatorText?: string;
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  renderLabel?: PickerPopupProps<TItem>['renderLabel'];
  selectedValue: Array<PickerItemValue<TItem>>;
  size?: ComponentSize;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerBodyStyles;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerBody<TItem extends PickerColumnItemData>({
  columns,
  empty,
  emptyText,
  hasDisabledFocusedItem,
  isWheelScrolling,
  loading,
  loadingIndicator,
  loadingIndicatorText,
  onFocusIndexChange,
  onItemPress,
  onWheelScrollStateChange,
  renderLabel,
  selectedValue,
  size,
  slotStyles,
  styles,
}: PickerBodyProps<TItem>) {
  const isEmpty =
    columns.length === 0 || columns.every(column => column.length === 0);
  const itemStyle = StyleSheet.flatten(styles.item);
  const itemHeight =
    typeof itemStyle?.minHeight === 'number' ? itemStyle.minHeight : 0;
  const defaultWheelHeight = itemHeight * WHEEL_VISIBLE_ITEM_COUNT;

  if (loading) {
    return (
      <View style={[styles.loading, slotStyles?.loading]}>
        {renderTextNode(loadingIndicator ?? loadingIndicatorText, text => (
          <Text>{text}</Text>
        ))}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={[styles.empty, slotStyles?.empty]}>
        {renderTextNode(empty ?? emptyText, text => (
          <Text>{text}</Text>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.body, slotStyles?.root]}>
      <GeometryReader
        defaultGeometry={{ width: 0, height: defaultWheelHeight }}
      >
        {({ height }) => (
          <PickerView
            columns={columns}
            empty={empty}
            emptyText={emptyText}
            hasDisabledFocusedItem={hasDisabledFocusedItem}
            isWheelScrolling={isWheelScrolling}
            onFocusIndexChange={onFocusIndexChange}
            onItemPress={onItemPress}
            onWheelScrollStateChange={onWheelScrollStateChange}
            renderLabel={renderLabel}
            selectedValue={selectedValue}
            size={size}
            slotStyles={slotStyles}
            styles={styles}
            wheelHeight={height}
          />
        )}
      </GeometryReader>
    </View>
  );
}
