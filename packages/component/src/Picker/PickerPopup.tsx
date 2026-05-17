import React from 'react';
import { Popup } from '../Popup';
import { PickerPanel } from './PickerPanel';
import type { PickerColumn, PickerPopupProps as PickerPopupConfig, PickerValue } from './types';

interface PickerPopupContainerProps {
  columns: PickerColumn[];
  draftValue: PickerValue[];
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  open: boolean;
  props: PickerPopupConfig;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  onCancelPress?: () => void;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onMaskPress?: () => void;
  onOkPress?: () => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerPopup({
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
}: PickerPopupContainerProps) {
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
