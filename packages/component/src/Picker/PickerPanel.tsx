import React from 'react';
import { View } from 'react-native';
import { PickerBody } from './PickerBody';
import { PickerHeader } from './PickerHeader';
import { PickerSafeArea } from './PickerSafeArea';
import type { PickerColumn, PickerPopupProps, PickerValue } from './types';

interface PickerPanelProps {
  columns: PickerColumn[];
  draftValue: PickerValue[];
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  props: PickerPopupProps;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  onCancelPress?: () => void;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onOkPress?: () => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerPanel({
  columns,
  draftValue,
  hasDisabledFocusedItem,
  isWheelScrolling,
  onCancelPress,
  onFocusIndexChange,
  onItemPress,
  onOkPress,
  onWheelScrollStateChange,
  props,
  styles,
}: PickerPanelProps) {
  const panelStyles = props.styles?.panel;

  return (
    <View style={[styles.panel, panelStyles?.panel]}>
      {props.renderHeader ? (
        props.renderHeader({
          draftValue,
          columns,
          hasDisabledFocusedItem,
          isWheelScrolling,
          okDisabled: props.okDisabled,
          onCancel: onCancelPress ?? (() => {}),
          onOk: onOkPress ?? (() => {}),
        })
      ) : (
        <PickerHeader
          cancel={props.cancel}
          cancelText={props.cancelText}
          ok={props.ok}
          okDisabled={props.okDisabled}
          okText={props.okText}
          onCancelPress={onCancelPress}
          onOkPress={onOkPress}
          slotStyles={panelStyles?.header}
          styles={styles}
          title={props.title}
          titleText={props.titleText}
        />
      )}
      <PickerSafeArea slotStyles={panelStyles} styles={styles}>
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
          slotStyles={panelStyles?.body}
          styles={styles}
        />
      </PickerSafeArea>
    </View>
  );
}
