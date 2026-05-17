import React from 'react';
import { Popup } from '../Popup';
import { PickerPanel } from './PickerPanel';
import type { PickerColumn, PickerPopupProps as PickerPopupConfig, PickerValue } from './types';

interface PickerPopupContainerProps {
  columns: PickerColumn[];
  draftValue: PickerValue[];
  open: boolean;
  props: PickerPopupConfig;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  onCancelPress?: () => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onMaskPress?: () => void;
  onOkPress?: () => void;
}

export function PickerPopup({
  columns,
  draftValue,
  onCancelPress,
  onItemPress,
  onMaskPress,
  onOkPress,
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
        onCancelPress={onCancelPress}
        onItemPress={onItemPress}
        onOkPress={onOkPress}
        props={props}
        styles={styles}
      />
    </Popup.FloatingPanel>
  );
}
