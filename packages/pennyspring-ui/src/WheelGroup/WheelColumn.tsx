import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { useMemoizedFn } from '../_hooks';
import { renderTextNode } from '../shares/node';
import { WheelColumnItem } from './WheelColumnItem';
import type { ReactNode } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { WheelGroupItemData, WheelGroupStyles } from './types';
import type { useWheelGroupStyles } from './style';

const DRAG_SETTLE_DELAY_MS = 120;
const SCROLL_EVENT_THROTTLE = 16;

export interface WheelColumnProps<
  TItem extends WheelGroupItemData = WheelGroupItemData,
> {
  columnIndex: number;
  disabled: boolean;
  empty?: ReactNode;
  emptyText?: string;
  itemHeight: number;
  items: TItem[];
  onActiveIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onScrollStateChange?: (isScrolling: boolean) => void;
  onSelectIndex: (columnIndex: number, itemIndex: number) => void;
  renderLabel?: (
    item: TItem,
    columnIndex: number,
    itemIndex: number,
  ) => ReactNode;
  selectedIndex: number;
  slotStyles?: WheelGroupStyles;
  styles: ReturnType<typeof useWheelGroupStyles>;
  testIDPrefix: string;
}

export function WheelColumn<TItem extends WheelGroupItemData>({
  columnIndex,
  disabled,
  empty,
  emptyText,
  itemHeight,
  items,
  onActiveIndexChange,
  onScrollStateChange,
  onSelectIndex,
  renderLabel,
  selectedIndex,
  slotStyles,
  styles,
  testIDPrefix,
}: WheelColumnProps<TItem>) {
  const scrollRef = useRef<ScrollView | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef<number>(selectedIndex);
  const activeIndexRef = useRef<number>(selectedIndex);
  const didSyncRef = useRef(false);
  const lastItemHeightRef = useRef(itemHeight);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  function clearSettleTimer() {
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }

  function resolveIndex(offsetY: number): number {
    if (itemHeight <= 0 || items.length === 0) {
      return -1;
    }

    const index = Math.round(offsetY / itemHeight);

    return Math.max(0, Math.min(index, items.length - 1));
  }

  function notifyActiveIndex(nextIndex: number) {
    if (nextIndex < 0 || nextIndex === activeIndexRef.current) {
      return;
    }

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    onActiveIndexChange?.(columnIndex, nextIndex);
  }

  function commitIndex(nextIndex: number) {
    onScrollStateChange?.(false);
    notifyActiveIndex(nextIndex);

    if (nextIndex < 0 || nextIndex === lastCommittedRef.current) {
      return;
    }

    lastCommittedRef.current = nextIndex;
    onSelectIndex(columnIndex, nextIndex);
  }

  useEffect(() => {
    if (selectedIndex < 0) {
      return;
    }

    const itemHeightChanged = lastItemHeightRef.current !== itemHeight;
    const needsSync =
      !didSyncRef.current ||
      itemHeightChanged ||
      selectedIndex !== activeIndexRef.current;

    lastItemHeightRef.current = itemHeight;
    didSyncRef.current = true;

    if (!needsSync) {
      return;
    }

    activeIndexRef.current = selectedIndex;
    lastCommittedRef.current = selectedIndex;
    setActiveIndex(selectedIndex);
    scrollRef.current?.scrollTo?.({
      animated: false,
      y: selectedIndex * itemHeight,
    });
  }, [itemHeight, selectedIndex]);

  useEffect(
    () => () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    },
    [],
  );

  const handleScroll = useMemoizedFn(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      notifyActiveIndex(resolveIndex(event.nativeEvent.contentOffset.y));
    },
  );

  const handleScrollBeginDrag = useMemoizedFn(() => {
    onScrollStateChange?.(true);
  });

  const handleScrollEndDrag = useMemoizedFn(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = resolveIndex(event.nativeEvent.contentOffset.y);

      clearSettleTimer();
      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        commitIndex(nextIndex);
      }, DRAG_SETTLE_DELAY_MS);
    },
  );

  const handleMomentumScrollBegin = useMemoizedFn(() => {
    clearSettleTimer();
    onScrollStateChange?.(true);
  });

  const handleMomentumScrollEnd = useMemoizedFn(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      clearSettleTimer();
      commitIndex(resolveIndex(event.nativeEvent.contentOffset.y));
    },
  );

  const handleContentSizeChange = useMemoizedFn(() => {
    if (selectedIndex < 0) {
      return;
    }

    scrollRef.current?.scrollTo?.({
      animated: false,
      y: selectedIndex * itemHeight,
    });
  });

  const handleItemSelect = useMemoizedFn((itemIndex: number) => {
    const item = items[itemIndex];

    if (!item || disabled || item.disabled) {
      return;
    }

    clearSettleTimer();
    activeIndexRef.current = itemIndex;
    setActiveIndex(itemIndex);
    onActiveIndexChange?.(columnIndex, itemIndex);

    if (itemIndex !== lastCommittedRef.current) {
      lastCommittedRef.current = itemIndex;
      onSelectIndex(columnIndex, itemIndex);
    }

    scrollRef.current?.scrollTo?.({
      animated: true,
      y: itemIndex * itemHeight,
    });
  });

  if (items.length === 0) {
    return (
      <View
        style={[styles.empty, slotStyles?.empty]}
        testID={`${testIDPrefix}-column-${columnIndex}`}
      >
        {renderTextNode(empty ?? emptyText, text => (
          <Text>{text}</Text>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      decelerationRate="fast"
      onContentSizeChange={handleContentSizeChange}
      onMomentumScrollBegin={handleMomentumScrollBegin}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      onScroll={handleScroll}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      ref={scrollRef}
      scrollEnabled={!disabled}
      scrollEventThrottle={SCROLL_EVENT_THROTTLE}
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      snapToInterval={itemHeight}
      style={[styles.column, slotStyles?.column]}
      testID={`${testIDPrefix}-column-scroll-${columnIndex}`}
    >
      {items.map((item, index) => (
        <WheelColumnItem
          active={index === activeIndex}
          columnIndex={columnIndex}
          disabled={disabled || item.disabled === true}
          item={item}
          itemIndex={index}
          key={`${item.value}-${index}`}
          onSelect={handleItemSelect}
          renderLabel={renderLabel}
          selected={index === selectedIndex}
          slotStyles={slotStyles}
          styles={styles}
          testIDPrefix={testIDPrefix}
        />
      ))}
    </ScrollView>
  );
}
