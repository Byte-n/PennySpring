import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import type { PickerColumnItemData, PickerColumnStyles, PickerProps } from './types';

type PickerItemPressableProps = PressableProps & {
  selected?: boolean;
};

const PickerItemPressable =
  Pressable as React.ComponentType<PickerItemPressableProps>;

interface PickerColumnItemProps {
  columnIndex: number;
  item: PickerColumnItemData;
  itemIndex: number;
  renderLabel?: PickerProps['renderLabel'];
  selected?: boolean;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerColumnStyles;
  onPress?: () => void;
}

function renderItemLabel(
  item: PickerColumnItemData,
  columnIndex: number,
  itemIndex: number,
  renderLabel?: PickerProps['renderLabel'],
): ReactNode {
  return renderLabel?.(item, columnIndex, itemIndex) ?? item.label ?? (
    <Text>{item.labelText}</Text>
  );
}

export function PickerColumnItem({
  columnIndex,
  item,
  itemIndex,
  onPress,
  renderLabel,
  selected,
  slotStyles,
  styles,
}: PickerColumnItemProps) {
  const content = renderItemLabel(item, columnIndex, itemIndex, renderLabel);

  return (
    <PickerItemPressable
      disabled={item.disabled}
      onPress={onPress}
      selected={selected}
      style={[
        styles.item,
        selected ? styles.selectedItem : undefined,
        item.disabled ? styles.disabledItem : undefined,
        slotStyles?.item,
      ]}
      testID={`picker-item-${columnIndex}-${itemIndex}`}
    >
      {typeof content === 'string' || typeof content === 'number' ? (
        <Text
          style={[
            styles.itemText,
            selected ? styles.selectedItemText : undefined,
            item.disabled ? styles.disabledItemText : undefined,
            slotStyles?.itemText,
          ]}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </PickerItemPressable>
  );
}
