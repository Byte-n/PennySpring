import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { PickerColumnItem } from './PickerColumnItem';
import type { PickerColumn as PickerColumnData, PickerColumnStyles, PickerPopupProps, PickerValue } from './types';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface PickerColumnProps {
  column: PickerColumnData;
  columnIndex: number;
  renderLabel?: PickerPopupProps['renderLabel'];
  selectedValue?: PickerValue;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerColumnStyles;
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
  const scrollRef = React.useRef<ScrollView | null>(null);
  const itemStyle = StyleSheet.flatten(styles.item);
  const itemHeight = typeof itemStyle?.minHeight === 'number'
    ? itemStyle.minHeight
    : 0;
  const selectedIndex = column.findIndex(item => item.value === selectedValue);

  React.useEffect(() => {
    if (selectedIndex < 0 || itemHeight <= 0) {
      return;
    }

    scrollRef.current?.scrollTo({
      animated: false,
      y: selectedIndex * itemHeight,
    });
  }, [itemHeight, selectedIndex]);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (itemHeight <= 0) {
      return;
    }

    const itemIndex = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    const normalizedItemIndex = Math.max(
      0,
      Math.min(itemIndex, column.length - 1),
    );

    onItemPress?.(columnIndex, normalizedItemIndex);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.columnContent}
      decelerationRate="fast"
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      snapToInterval={itemHeight > 0 ? itemHeight : undefined}
      style={[styles.column, styles.columnScroll, slotStyles?.column]}
      testID={`picker-column-scroll-${columnIndex}`}
      onMomentumScrollEnd={handleMomentumScrollEnd}
    >
      {column.map((item, index) => (
        <PickerColumnItem
          columnIndex={columnIndex}
          item={item}
          itemIndex={index}
          key={`${item.value}-${index}`}
          onPress={() => onItemPress?.(columnIndex, index)}
          renderLabel={renderLabel}
          selected={item.value === selectedValue}
          slotStyles={slotStyles}
          styles={styles}
        />
      ))}
    </ScrollView>
  );
}
