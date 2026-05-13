import React from 'react';
import { Popup } from '../Popup';
import { PickerPanel } from './PickerPanel';
import type { PickerProps, PickerValue } from './types';

interface PickerPopupProps {
  columns: PickerProps['columns'];
  draftValue: PickerValue[];
  open: boolean;
  props: Pick<
    PickerProps,
    | 'cancel'
    | 'cancelText'
    | 'empty'
    | 'emptyText'
    | 'loading'
    | 'loadingIndicator'
    | 'loadingIndicatorText'
    | 'ok'
    | 'okDisabled'
    | 'okText'
    | 'renderLabel'
    | 'styles'
    | 'title'
    | 'titleText'
  >;
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
}: PickerPopupProps) {
  return (
    <Popup
      open={open}
      position="bottom"
      onCancel={() => onMaskPress?.()}
      style={[styles.popup, props.styles?.popup?.popup]}
      styles={{
        mask: [styles.mask, props.styles?.popup?.mask],
        body: { padding: 0 },
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
    </Popup>
  );
}
