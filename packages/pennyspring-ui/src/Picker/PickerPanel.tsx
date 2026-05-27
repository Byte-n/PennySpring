import React from 'react';
import { View } from 'react-native';
import { PickerBody } from './PickerBody';
import { PickerHeader } from './PickerHeader';
import { PickerSafeArea } from './PickerSafeArea';
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
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  onCancelPress?: () => void;
  onFocusIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onItemPress?: (columnIndex: number, itemIndex: number) => void;
  onOkPress?: () => void;
  onWheelScrollStateChange?: (isScrolling: boolean) => void;
}

export function PickerPanel<TItem extends PickerColumnItemData>({
  columns,
  draftValue,
  externalPanelStyles,
  hasDisabledFocusedItem,
  isWheelScrolling,
  onCancelPress,
  onFocusIndexChange,
  onItemPress,
  onOkPress,
  onWheelScrollStateChange,
  props,
  styles,
}: PickerPanelProps<TItem>) {
  const header = props.renderHeader === null ? null : (
    <PickerHeader
      cancel={props.cancel}
      cancelText={props.cancelText}
      ok={props.ok}
      okDisabled={props.okDisabled}
      okText={props.okText}
      onCancelPress={onCancelPress}
      onOkPress={onOkPress}
      slotStyles={externalPanelStyles?.header}
      styles={styles}
      title={props.title}
      titleText={props.titleText}
    />
  );

  return (
    <View style={[styles.panel, externalPanelStyles?.root]}>
      {props.renderHeader === null ? null : props.renderHeader !== undefined ? (
        props.renderHeader({
          header,
          draftValue,
          columns,
          hasDisabledFocusedItem,
          isWheelScrolling,
          okDisabled: props.okDisabled,
          onCancel: onCancelPress ?? (() => {}),
          onOk: onOkPress ?? (() => {}),
        })
      ) : header}
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
          slotStyles={externalPanelStyles?.body}
          styles={styles}
        />
      </PickerSafeArea>
    </View>
  );
}
