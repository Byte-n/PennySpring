import type { ComponentSize } from '../shares/types';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { PickerPopup } from './PickerPopup';
import { PickerTrigger } from './PickerTrigger';
import { usePickerStyles } from './usePickerStyles';
import { useControllableValue } from '../_hooks';
import type { PickerProps, PickerValue } from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';
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

function getItemDisplayText(
  item: ReturnType<typeof getSelectedItems>[number],
): string | undefined {
  if (item === undefined) {
    return undefined;
  }

  if (item.labelText !== undefined && item.labelText !== '') {
    return item.labelText;
  }

  if (typeof item.label === 'string' || typeof item.label === 'number') {
    return String(item.label);
  }

  return undefined;
}

function getTriggerValueText(
  columns: PickerProps['columns'],
  pickerValue: PickerValue[],
): string | undefined {
  const itemTexts = getSelectedItems(columns, pickerValue)
    .map(item => getItemDisplayText(item))
    .filter((item): item is string => item !== undefined);

  if (itemTexts.length === 0) {
    return undefined;
  }

  return itemTexts.join(' / ');
}

export function Picker({
  allowClear,
  children,
  columns,
  defaultOpen,
  defaultValue,
  displayInputProps,
  disabled,
  label,
  popupProps,
  onCancel,
  onChange,
  onClear,
  onOk,
  onOpenChange,
  open,
  placeholder,
  readonly,
  size = DEFAULT_SIZE,
  style,
  triggerStyle,
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
  const triggerValueText = getTriggerValueText(columns, mainValue);
  const hasMainValue = mainValue.length > 0;

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
    if (disabled || popupProps?.okDisabled) {
      return;
    }

    const nextValue = draftValueRef.current;

    setMainValue(nextValue);
    onOk?.(nextValue, { items: getSelectedItems(columns, nextValue) });

    if (!popupProps?.loading && !hasEmptyColumn(columns)) {
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
      reason: 'select',
      columnIndex,
      item,
      itemIndex,
      items: getSelectedItems(columns, nextDraftValue),
      value: item.value,
    });
  };

  const handleClearPress = () => {
    const nextValue: PickerValue[] = [];
    draftValueRef.current = nextValue;
    setDraftValue(nextValue);
    setMainValue(nextValue);
    onChange?.(nextValue, {
      reason: 'clear',
      items: getSelectedItems(columns, nextValue),
    });
    onClear?.();
  };

  return (
    <View style={style}>
      <PickerTrigger
        allowClear={allowClear}
        displayInputProps={displayInputProps}
        disabled={disabled}
        hasValue={hasMainValue}
        label={label}
        onClearPress={handleClearPress}
        onPress={handleTriggerPress}
        placeholder={placeholder}
        readonly={readonly}
        styles={tokenStyles}
        triggerStyle={triggerStyle}
        valueText={triggerValueText}
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
          ...popupProps,
          cancelText: popupProps?.cancelText ?? DEFAULT_CANCEL_TEXT,
          okText: popupProps?.okText ?? DEFAULT_OK_TEXT,
        }}
        styles={tokenStyles}
      />
    </View>
  );
}
