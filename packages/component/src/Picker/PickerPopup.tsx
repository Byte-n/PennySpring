import React from 'react';
import { Pressable, View } from 'react-native';
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
  if (!open) {
    return null;
  }

  return (
    <View style={[styles.popup, props.styles?.popup]}>
      <Pressable
        onPress={onMaskPress}
        style={[styles.mask, props.styles?.mask]}
        testID="picker-mask"
      />
      <PickerPanel
        columns={columns}
        draftValue={draftValue}
        onCancelPress={onCancelPress}
        onItemPress={onItemPress}
        onOkPress={onOkPress}
        props={props}
        styles={styles}
      />
    </View>
  );
}
