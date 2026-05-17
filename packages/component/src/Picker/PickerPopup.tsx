import React from 'react';
import { Popup } from '../Popup';
import { PickerPanel } from './PickerPanel';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerItemValue,
  PickerPopupProps as PickerPopupConfig,
} from './types';

interface PickerPopupContainerProps<TItem extends PickerColumnItemData> {
  columns: Array<PickerColumn<TItem>>;
  draftValue: Array<PickerItemValue<TItem>>;
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  open: boolean;
  props: PickerPopupConfig<TItem>;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  onCancelPress?: () => void;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onMaskPress?: () => void;
  onOkPress?: () => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerPopup<TItem extends PickerColumnItemData>({
  columns,
  draftValue,
  hasDisabledFocusedItem,
  isWheelScrolling,
  onCancelPress,
  onFocusIndexChange,
  onItemPress,
  onMaskPress,
  onOkPress,
  onWheelScrollStateChange,
  open,
  props,
  styles,
}: PickerPopupContainerProps<TItem>) {
  return (
    <Popup.FloatingPanel
      open={open}
      position="bottom"
      onCancel={() => onMaskPress?.()}
      style={props.styles?.popup?.popup}
      styles={{
        mask: [styles.mask, props.styles?.popup?.mask],
        body: styles.popup,
        content: { padding: 0 },
      }}
    >
      <PickerPanel
        columns={columns}
        draftValue={draftValue}
        hasDisabledFocusedItem={hasDisabledFocusedItem}
        isWheelScrolling={isWheelScrolling}
        onCancelPress={onCancelPress}
        onFocusIndexChange={onFocusIndexChange}
        onItemPress={onItemPress}
        onOkPress={onOkPress}
        onWheelScrollStateChange={onWheelScrollStateChange}
        props={props}
        styles={styles}
      />
    </Popup.FloatingPanel>
  );
}
