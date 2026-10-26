import React from 'react';
import { View } from 'react-native';
import { PickerBody } from './PickerBody';
import { PickerSafeArea } from './PickerSafeArea';
import type { ComponentSize } from '../shares/types';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerItemValue,
  PickerPanelStyles,
  PickerPopupProps,
} from './types';

interface PickerPanelProps<TItem extends PickerColumnItemData> {
  columns: Array<PickerColumn<TItem>>;
  draftValue: Array<PickerItemValue<TItem>>;
  externalPanelStyles?: PickerPanelStyles;
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  props: PickerPopupProps<TItem>;
  size?: ComponentSize;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerPanel<TItem extends PickerColumnItemData>({
  columns,
  draftValue,
  externalPanelStyles,
  hasDisabledFocusedItem,
  isWheelScrolling,
  onFocusIndexChange,
  onItemPress,
  onWheelScrollStateChange,
  props,
  size,
  styles,
}: PickerPanelProps<TItem>) {
  return (
    <View style={[styles.panel, externalPanelStyles?.root]}>
      <PickerSafeArea slotStyles={externalPanelStyles} styles={styles}>
        <PickerBody
          columns={columns}
          empty={props.empty}
          emptyText={props.emptyText}
          hasDisabledFocusedItem={hasDisabledFocusedItem}
          isWheelScrolling={isWheelScrolling}
          loading={props.loading}
          loadingIndicator={props.loadingIndicator}
          loadingIndicatorText={props.loadingIndicatorText}
          onFocusIndexChange={onFocusIndexChange}
          onItemPress={onItemPress}
          onWheelScrollStateChange={onWheelScrollStateChange}
          renderLabel={props.renderLabel}
          selectedValue={draftValue}
          size={size}
          slotStyles={externalPanelStyles?.body}
          styles={styles}
        />
      </PickerSafeArea>
    </View>
  );
}
