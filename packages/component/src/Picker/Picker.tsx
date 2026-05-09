import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { PickerPopup } from './PickerPopup';
import { PickerTrigger } from './PickerTrigger';
import { usePickerStyles } from './usePickerStyles';
import type { PickerProps, PickerSize, PickerValue } from './types';

const DEFAULT_SIZE: PickerSize = 'normal';
const DEFAULT_CANCEL_TEXT = 'Cancel';
const DEFAULT_OK_TEXT = 'OK';

function resolveOpen(defaultOpen?: boolean, open?: boolean): boolean {
  return open ?? defaultOpen ?? false;
}

function resolveValue(
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
  readOnly,
  renderLabel,
  size = DEFAULT_SIZE,
  style,
  styles: slotStyles,
  title,
  titleText,
  value,
}: PickerProps) {
  const tokenStyles = usePickerStyles({ size });
  const [internalOpen, setInternalOpen] = useState(
    resolveOpen(defaultOpen, open),
  );
  const isOpenControlled = open !== undefined;
  const isOpen = isOpenControlled ? open : internalOpen || Boolean(readOnly);
  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    resolveValue(defaultValue, value),
  );
  const mainValue = isValueControlled ? value : internalValue;
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

    if (!isOpenControlled) {
      setInternalOpen(true);
    }

    onOpenChange?.(true, { reason: 'trigger' });
  };

  const closeInternal = (reason: 'cancel' | 'mask' | 'ok') => {
    if (!isOpenControlled) {
      setInternalOpen(false);
    }

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

    if (!isValueControlled) {
      setInternalValue(nextValue);
    }

    onOk?.(nextValue, { items: getSelectedItems(columns, nextValue) });

    if (!loading && !hasEmptyColumn(columns)) {
      closeInternal('ok');
    }
  };

  const handleItemPress = (columnIndex: number, itemIndex: number) => {
    const item = columns[columnIndex]?.[itemIndex];

    if (item === undefined || item.disabled || readOnly) {
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
