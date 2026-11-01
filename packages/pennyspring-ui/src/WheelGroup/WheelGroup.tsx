import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { Row } from '../Row';
import { useControllableValue, useMemoizedFn } from '../_hooks';
import { WheelColumn } from './WheelColumn';
import { useWheelGroupStyles } from './style';
import type { LayoutChangeEvent } from 'react-native';
import type {
  WheelGroupItemData,
  WheelGroupItemValue,
  WheelGroupProps,
} from './types';

const DEFAULT_ROWS = 5;
const MIN_ROWS = 3;
const MAX_ROWS = 7;
const ROW_FIT_TOLERANCE = 0.5;
const DEFAULT_TEST_ID = 'wheel-group';

function normalizeRows(rows: number): number {
  const roundedRows = Math.round(rows);
  const oddRows = roundedRows % 2 === 0 ? roundedRows - 1 : roundedRows;

  return Math.max(MIN_ROWS, Math.min(oddRows, MAX_ROWS));
}

function resolveRowsFromHeight(height: number, itemHeight: number): number {
  if (itemHeight <= 0) {
    return DEFAULT_ROWS;
  }

  return normalizeRows(Math.floor((height + ROW_FIT_TOLERANCE) / itemHeight));
}

export function WheelGroup<
  TItem extends WheelGroupItemData = WheelGroupItemData,
>({
  columns,
  value,
  defaultValue,
  onChange,
  onActiveIndexChange,
  onScrollStateChange,
  rows = DEFAULT_ROWS,
  itemHeight,
  fit = 'content',
  height,
  disabled = false,
  renderLabel,
  empty,
  emptyText,
  style,
  styles: externalStyles,
  testID = DEFAULT_TEST_ID,
}: WheelGroupProps<TItem>) {
  const { token } = useTheme();
  const resolvedItemHeight = itemHeight ?? token.controlHeight;
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [mainValue, setMainValue] = useControllableValue<
    Array<WheelGroupItemValue<TItem>>
  >(defaultValue, value, undefined);
  const selectedValues = mainValue ?? [];

  const suppliedHeight = height ?? measuredHeight;
  const fillContainer = fit === 'container' && height === undefined;
  const useContainerHeight = fit === 'container' && suppliedHeight > 0;
  const visibleRows = useContainerHeight
    ? resolveRowsFromHeight(suppliedHeight, resolvedItemHeight)
    : normalizeRows(rows);
  const viewportHeight = visibleRows * resolvedItemHeight;
  const containerHeight = useContainerHeight ? suppliedHeight : viewportHeight;
  const contentInset = ((visibleRows - 1) / 2) * resolvedItemHeight;

  const styleOptions = useMemo(
    () => ({
      containerHeight,
      contentInset,
      fill: fillContainer,
      itemHeight: resolvedItemHeight,
      viewportHeight,
    }),
    [
      containerHeight,
      contentInset,
      fillContainer,
      resolvedItemHeight,
      viewportHeight,
    ],
  );
  const tokenStyles = useWheelGroupStyles(styleOptions);

  const selectedIndexes = columns.map((column, columnIndex) =>
    column.findIndex(item => item.value === selectedValues[columnIndex]),
  );

  const handleLayout = useMemoizedFn((event: LayoutChangeEvent) => {
    setMeasuredHeight(event.nativeEvent.layout.height);
  });

  const handleSelectIndex = useMemoizedFn(
    (columnIndex: number, itemIndex: number) => {
      const item = columns[columnIndex]?.[itemIndex];

      if (item === undefined) {
        return;
      }

      const nextLength = Math.max(selectedValues.length, columnIndex + 1);
      const nextValue: Array<WheelGroupItemValue<TItem>> = [];

      for (let index = 0; index < nextLength; index += 1) {
        const itemValue =
          index === columnIndex ? item.value : selectedValues[index];

        if (itemValue !== undefined) {
          nextValue[index] = itemValue;
        }
      }

      nextValue.length = nextLength;
      setMainValue(nextValue);
      onChange?.(nextValue, {
        columnIndex,
        itemIndex,
        item,
        items: columns.map((column, index) =>
          column.find(entry => entry.value === nextValue[index]),
        ),
      });
    },
  );

  return (
    <View
      onLayout={fit === 'container' ? handleLayout : undefined}
      style={[tokenStyles.root, externalStyles?.root, style]}
      testID={testID}
    >
      <View
        pointerEvents="none"
        style={[tokenStyles.band, externalStyles?.band]}
        testID={`${testID}-indicator`}
      />
      <Row testID={`${testID}-row`}>
        {columns.map((column, columnIndex) => (
          <WheelColumn
            columnIndex={columnIndex}
            disabled={disabled}
            empty={empty}
            emptyText={emptyText}
            itemHeight={resolvedItemHeight}
            items={column}
            key={columnIndex}
            onActiveIndexChange={onActiveIndexChange}
            onScrollStateChange={onScrollStateChange}
            onSelectIndex={handleSelectIndex}
            renderLabel={renderLabel}
            selectedIndex={selectedIndexes[columnIndex]}
            slotStyles={externalStyles}
            styles={tokenStyles}
            testIDPrefix={testID}
          />
        ))}
      </Row>
    </View>
  );
}
