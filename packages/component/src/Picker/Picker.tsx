import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { PickerPopup } from './PickerPopup';
import { PickerTrigger } from './PickerTrigger';
import { usePickerStyles } from './usePickerStyles';
import { useControllableValue } from '../_hooks';
import type { PickerProps, PickerSize, PickerValue } from './types';

const DEFAULT_SIZE: PickerSize = 'normal';
const DEFAULT_CANCEL_TEXT = 'Cancel';
const DEFAULT_OK_TEXT = 'OK';

function getInitialValue(
  defaultValue?: PickerValue[],
  value?: PickerValue[],
): PickerValue[] {
  if (value !== undefined) {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return [];
}

function getSelectedItems(
  columns: PickerProps['columns'],
  pickerValue: PickerValue[],
) {
  return columns.map((column, columnIndex) =>
    column.find(item => item.value === pickerValue[columnIndex]),
  );
}

function hasEmptyColumn(columns: PickerProps['columns']): boolean {
  return columns.some(column => column.length === 0);
}

export function Picker({
  cancel,
  cancelText = DEFAULT_CANCEL_TEXT,
  children,
  columns,
  defaultOpen,
  defaultValue,
  disabled,
  empty,
  emptyText,
  loading,
  loadingIndicator,
  loadingIndicatorText,
  ok,
  okDisabled,
  okText = DEFAULT_OK_TEXT,
  onCancel,
  onChange,
  onOk,
  onOpenChange,
  open,
  placeholder,
  readonly,
  renderLabel,
  size = DEFAULT_SIZE,
  style,
  styles: slotStyles,
  title,
  titleText,
  value,
}: PickerProps) {
  const tokenStyles = usePickerStyles({ size });
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true || Boolean(readonly);
  const [mainValue = [], setMainValue] = useControllableValue(
    getInitialValue(defaultValue, value),
    value,
    undefined,
  );
  const [draftValue, setDraftValue] = useState(mainValue);
  const draftValueRef = useRef(draftValue);

  useEffect(() => {
    if (isOpen) {
      setDraftValue(mainValue);
      draftValueRef.current = mainValue;
    }
  }, [isOpen, mainValue]);

  const handleTriggerPress = () => {
    if (disabled) {
      return;
    }

    setResolvedOpen(true);
    onOpenChange?.(true, { reason: 'trigger' });
  };

  const closeInternal = (reason: 'cancel' | 'mask' | 'ok') => {
    setResolvedOpen(false);
    onOpenChange?.(false, { reason });
  };

  const handleCancelPress = () => {
    onCancel?.({ reason: 'cancel' });
    closeInternal('cancel');
  };

  const handleMaskPress = () => {
    onCancel?.({ reason: 'mask' });
    closeInternal('mask');
  };

  const handleOkPress = () => {
    if (disabled || okDisabled) {
      return;
    }

    const nextValue = draftValueRef.current;

    setMainValue(nextValue);
    onOk?.(nextValue, { items: getSelectedItems(columns, nextValue) });

    if (!loading && !hasEmptyColumn(columns)) {
      closeInternal('ok');
    }
  };

  const handleItemPress = (columnIndex: number, itemIndex: number) => {
    const item = columns[columnIndex]?.[itemIndex];

    if (item === undefined || item.disabled || readonly) {
      return;
    }

    const nextDraftValue = draftValue.map((draftItem, draftIndex) =>
      draftIndex === columnIndex ? item.value : draftItem,
    );

    if (nextDraftValue[columnIndex] === undefined) {
      nextDraftValue[columnIndex] = item.value;
    }

    draftValueRef.current = nextDraftValue;
    setDraftValue(nextDraftValue);
    onChange?.(nextDraftValue, {
      columnIndex,
      item,
      itemIndex,
      items: getSelectedItems(columns, nextDraftValue),
      value: item.value,
    });
  };

  return (
    <View style={style}>
      <PickerTrigger
        disabled={disabled}
        onPress={handleTriggerPress}
        placeholder={placeholder}
        slotStyles={slotStyles}
        styles={tokenStyles}
      >
        {children}
      </PickerTrigger>
      <PickerPopup
        columns={columns}
        draftValue={draftValue}
        onItemPress={handleItemPress}
        open={isOpen}
        onCancelPress={handleCancelPress}
        onMaskPress={handleMaskPress}
        onOkPress={handleOkPress}
        props={{
          cancel,
          cancelText,
          empty,
          emptyText,
          loading,
          loadingIndicator,
          loadingIndicatorText,
          ok,
          okDisabled,
          okText,
          renderLabel,
          styles: slotStyles,
          title,
          titleText,
        }}
        styles={tokenStyles}
      />
    </View>
  );
}
