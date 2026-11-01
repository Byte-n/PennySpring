import React from 'react';
import { useTheme } from '@pennyspring/theme';
import { WheelGroup } from '../WheelGroup';
import { getPickerItemHeight } from './usePickerStyles';
import type { WheelGroupStyles } from '../WheelGroup';
import type { ComponentSize } from '../shares/types';
import type {
  PickerBodyStyles,
  PickerColumn,
  PickerColumnItemData,
  PickerItemValue,
  PickerPopupProps,
} from './types';

interface PickerViewProps<TItem extends PickerColumnItemData> {
  columns: Array<PickerColumn<TItem>>;
  empty?: React.ReactNode;
  emptyText?: string;
  renderLabel?: PickerPopupProps<TItem>['renderLabel'];
  selectedValue: Array<PickerItemValue<TItem>>;
  size?: ComponentSize;
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
  size = 'normal',
  slotStyles,
  styles,
  wheelHeight,
}: PickerViewProps<TItem>) {
  const { token } = useTheme();
  const itemHeight = getPickerItemHeight(size, token);
  const showErrorBand =
    hasDisabledFocusedItem === true && isWheelScrolling !== true;
  const bandErrorStyle = styles.indicatorError;
  const wheelStyles = React.useMemo<WheelGroupStyles>(
    () => ({
      band: [showErrorBand ? bandErrorStyle : undefined, slotStyles?.indicator],
      column: slotStyles?.column,
      item: slotStyles?.item,
      itemText: slotStyles?.itemText,
      empty: slotStyles?.empty,
    }),
    [bandErrorStyle, showErrorBand, slotStyles],
  );

  return (
    <WheelGroup
      columns={columns}
      empty={empty}
      emptyText={emptyText}
      fit="container"
      height={wheelHeight}
      itemHeight={itemHeight}
      onActiveIndexChange={onFocusIndexChange}
      onChange={(nextValue, params) => {
        onItemPress?.(params.columnIndex, params.itemIndex);
      }}
      onScrollStateChange={onWheelScrollStateChange}
      renderLabel={renderLabel}
      styles={wheelStyles}
      testID="picker"
      value={selectedValue}
    />
  );
}
