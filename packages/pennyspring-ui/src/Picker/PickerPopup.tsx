import React from 'react';
import { Popup } from '../Popup';
import { PickerHeader } from './PickerHeader';
import { PickerPanel } from './PickerPanel';
import type { ComponentSize } from '../shares/types';
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
  size?: ComponentSize;
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
  size,
  styles,
}: PickerPopupContainerProps<TItem>) {
  const defaultHeader = props.renderHeader === null ? null : (
    <PickerHeader
      cancel={props.cancel}
      cancelText={props.cancelText}
      ok={props.ok}
      okDisabled={props.okDisabled}
      okText={props.okText}
      onCancelPress={onCancelPress}
      onOkPress={onOkPress}
      size={size}
      slotStyles={externalStyles?.panel?.header}
      styles={styles}
      title={props.title}
      titleText={props.titleText}
    />
  );
  const header = props.renderHeader === null
    ? null
    : props.renderHeader !== undefined
      ? props.renderHeader({
        header: defaultHeader,
        draftValue,
        columns,
        hasDisabledFocusedItem,
        isWheelScrolling,
        okDisabled: props.okDisabled,
        onCancel: onCancelPress ?? (() => {}),
        onOk: onOkPress ?? (() => {}),
      })
      : defaultHeader;

  return (
    <Popup.FloatingPanel
      footer={null}
      header={header}
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
        onFocusIndexChange={onFocusIndexChange}
        onItemPress={onItemPress}
        onWheelScrollStateChange={onWheelScrollStateChange}
        props={props}
        styles={styles}
      />
    </Popup.FloatingPanel>
  );
}
