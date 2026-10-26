import React from 'react';
import { useTheme } from '@pennyspring/theme';
import { Popup } from '../Popup';
import { getFloatingPanelSizeConfig } from '../Popup/floatingPanelSize';
import { PickerHeader } from './PickerHeader';
import { PickerPanel } from './PickerPanel';
import {
  getPickerItemHeight,
  MIN_WHEEL_VISIBLE_ITEM_COUNT,
  WHEEL_VISIBLE_ITEM_COUNT,
} from './usePickerStyles';
import type { AliasToken } from '@pennyspring/theme';
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

function getPickerPanelHeight(
  hasHeader: boolean,
  size: ComponentSize,
  token: AliasToken,
  visibleItemCount: number,
): number {
  const floatingPanelSize = getFloatingPanelSizeConfig(size);
  const itemHeight = getPickerItemHeight(size, token);
  const headerSectionHeight = hasHeader
    ? Math.max(token.controlHeight, itemHeight)
      + floatingPanelSize.contentPadding(token)
      + floatingPanelSize.sectionPadding(token)
    : 0;
  const pickerBodyInset = token.paddingMD + token.paddingSM;
  const wheelHeight = itemHeight * visibleItemCount;

  return floatingPanelSize.handleHeight(token)
    + headerSectionHeight
    + pickerBodyInset
    + wheelHeight;
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
  const { token } = useTheme();
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
  const resolvedSize = size ?? 'normal';
  const height = getPickerPanelHeight(
    header !== null,
    resolvedSize,
    token,
    WHEEL_VISIBLE_ITEM_COUNT,
  );
  const minHeight = getPickerPanelHeight(
    header !== null,
    resolvedSize,
    token,
    MIN_WHEEL_VISIBLE_ITEM_COUNT,
  );

  return (
    <Popup.FloatingPanel
      bodyScrollable={false}
      footer={null}
      header={header}
      height={height}
      minHeight={minHeight}
      open={open}
      position="bottom"
      size={resolvedSize}
      onCancel={() => onMaskPress?.()}
      style={externalStyles?.popup?.root}
      styles={{
        mask: [styles.mask, externalStyles?.popup?.mask],
        body: [styles.popup, externalStyles?.popup?.container],
        content: [styles.popupContent, externalStyles?.popup?.content],
        panelBody: styles.popupPanelBody,
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
        size={resolvedSize}
        styles={styles}
      />
    </Popup.FloatingPanel>
  );
}
