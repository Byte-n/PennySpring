import React from 'react';
import { Popup } from '../Popup';
import { PickerPanel } from './PickerPanel';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerItemValue,
  PickerPopupProps as PickerPopupConfig,
  PickerStyles,
} from './types';

interface PickerPopupContainerProps<TItem extends PickerColumnItemData> {
  columns: Array<PickerColumn<TItem>>;
  draftValue: Array<PickerItemValue<TItem>>;
  externalStyles?: PickerStyles;
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
  externalStyles,
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
      footer={null}
      header={null}
      open={open}
      position="bottom"
      onCancel={() => onMaskPress?.()}
      style={externalStyles?.popup?.root}
      styles={{
        mask: [styles.mask, externalStyles?.popup?.mask],
        body: [styles.popup, externalStyles?.popup?.container],
        content: [styles.popupContent, externalStyles?.popup?.content],
        handle: externalStyles?.popup?.handle,
        handleIndicator: externalStyles?.popup?.handleIndicator,
      }}
    >
      <PickerPanel
        columns={columns}
        draftValue={draftValue}
        externalPanelStyles={externalStyles?.panel}
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
