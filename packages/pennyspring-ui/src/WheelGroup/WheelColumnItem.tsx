import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '../Text';
import { isPrimitiveContent } from '../shares/node';
import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import type { WheelGroupStyles } from './types';
import type { WheelGroupItemData } from './types';
import type { useWheelGroupStyles } from './style';

type WheelItemPressableProps = PressableProps & {
  selected?: boolean;
};

const WheelItemPressable =
  Pressable as React.ComponentType<WheelItemPressableProps>;

export interface WheelColumnItemProps<
  TItem extends WheelGroupItemData = WheelGroupItemData,
> {
  active: boolean;
  columnIndex: number;
  disabled: boolean;
  item: TItem;
  itemIndex: number;
  onSelect: (itemIndex: number) => void;
  renderLabel?: (
    item: TItem,
    columnIndex: number,
    itemIndex: number,
  ) => ReactNode;
  selected: boolean;
  slotStyles?: WheelGroupStyles;
  styles: ReturnType<typeof useWheelGroupStyles>;
  testIDPrefix: string;
}

function renderItemContent<TItem extends WheelGroupItemData>(
  item: TItem,
  columnIndex: number,
  itemIndex: number,
  renderLabel?: (
    item: TItem,
    columnIndex: number,
    itemIndex: number,
  ) => ReactNode,
): ReactNode {
  return (
    renderLabel?.(item, columnIndex, itemIndex)
    ?? item.label
    ?? <Text>{item.labelText}</Text>
  );
}

function WheelColumnItemInner<TItem extends WheelGroupItemData>({
  active,
  columnIndex,
  disabled,
  item,
  itemIndex,
  onSelect,
  renderLabel,
  selected,
  slotStyles,
  styles,
  testIDPrefix,
}: WheelColumnItemProps<TItem>) {
  const content = renderItemContent(item, columnIndex, itemIndex, renderLabel);

  function handlePress() {
    if (disabled || item.disabled) {
      return;
    }

    onSelect(itemIndex);
  }

  return (
    <WheelItemPressable
      disabled={disabled}
      onPress={handlePress}
      selected={selected}
      style={[
        styles.item,
        disabled ? styles.itemDisabled : undefined,
        slotStyles?.item,
      ]}
      testID={`${testIDPrefix}-item-${columnIndex}-${itemIndex}`}
    >
      {isPrimitiveContent(content) ? (
        <Text
          color={disabled ? 'disabled' : active ? 'primaryText' : 'default'}
          numberOfLines={1}
          style={slotStyles?.itemText}
          weight={active ? 'strong' : 'regular'}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </WheelItemPressable>
  );
}

export const WheelColumnItem = React.memo(
  WheelColumnItemInner,
) as unknown as typeof WheelColumnItemInner;
