import React from 'react';
import { View } from 'react-native';
import { PickerBody } from './PickerBody';
import { PickerHeader } from './PickerHeader';
import { PickerSafeArea } from './PickerSafeArea';
import type { PickerProps, PickerValue } from './types';

interface PickerPanelProps {
  columns: PickerProps['columns'];
  draftValue: PickerValue[];
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
  onOkPress?: () => void;
}

export function PickerPanel({
  columns,
  draftValue,
  onCancelPress,
  onItemPress,
  onOkPress,
  props,
  styles,
}: PickerPanelProps) {
  return (
    <View style={[styles.panel, props.styles?.panel]}>
      <PickerHeader
        cancel={props.cancel}
        cancelText={props.cancelText}
        ok={props.ok}
        okDisabled={props.okDisabled}
        okText={props.okText}
        onCancelPress={onCancelPress}
        onOkPress={onOkPress}
        slotStyles={props.styles}
        styles={styles}
        title={props.title}
        titleText={props.titleText}
      />
      <PickerSafeArea slotStyles={props.styles} styles={styles}>
        <PickerBody
          columns={columns}
          empty={props.empty}
          emptyText={props.emptyText}
          loading={props.loading}
          loadingIndicator={props.loadingIndicator}
          loadingIndicatorText={props.loadingIndicatorText}
          onItemPress={onItemPress}
          renderLabel={props.renderLabel}
          selectedValue={draftValue}
          slotStyles={props.styles}
          styles={styles}
        />
      </PickerSafeArea>
    </View>
  );
}
