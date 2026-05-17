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
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerColumn({
  column,
  columnIndex,
  onFocusIndexChange,
  onItemPress,
  onWheelScrollStateChange,
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

    onFocusIndexChange?.(columnIndex, normalizedItemIndex);
    onItemPress?.(columnIndex, normalizedItemIndex);
    onWheelScrollStateChange?.(false);
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
      onMomentumScrollBegin={() => onWheelScrollStateChange?.(true)}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      onScrollBeginDrag={() => onWheelScrollStateChange?.(true)}
      onScrollEndDrag={() => onWheelScrollStateChange?.(false)}
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
