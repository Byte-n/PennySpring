import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { PickerView } from './PickerView';
import type { ReactNode } from 'react';
import type { PickerBodyStyles, PickerColumn, PickerPopupProps, PickerValue } from './types';

interface PickerBodyProps {
  columns: PickerColumn[];
  empty?: ReactNode;
  emptyText?: string;
  loading?: boolean;
  loadingIndicator?: ReactNode;
  loadingIndicatorText?: string;
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  renderLabel?: PickerPopupProps['renderLabel'];
  selectedValue: PickerValue[];
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerBodyStyles;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerBody({
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
  slotStyles,
  styles,
}: PickerBodyProps) {
  const isEmpty = columns.length === 0 || columns.every(column => column.length === 0);

  if (loading) {
    return (
      <View style={[styles.loading, slotStyles?.loading]}>
        {loadingIndicator ?? <Text>{loadingIndicatorText}</Text>}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={[styles.empty, slotStyles?.empty]}>
        {empty ?? <Text>{emptyText}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.body, slotStyles?.body]}>
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
        slotStyles={slotStyles}
        styles={styles}
      />
    </View>
  );
}
