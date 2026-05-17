import type { ComponentSize } from '../shares/types';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { PickerPopup } from './PickerPopup';
import { PickerTrigger } from './PickerTrigger';
import { usePickerStyles } from './usePickerStyles';
import { useControllableValue } from '../_hooks';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerItemValue,
  PickerProps,
} from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_CANCEL_TEXT = '取消';
const DEFAULT_OK_TEXT = '确定';

function getInitialValue<TItem extends PickerColumnItemData>(
  defaultValue?: Array<PickerItemValue<TItem>>,
  value?: Array<PickerItemValue<TItem>>,
): Array<PickerItemValue<TItem>> {
  if (value !== undefined) {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return [];
}

function getSelectedItems<TItem extends PickerColumnItemData>(
  columns: Array<PickerColumn<TItem>>,
  pickerValue: Array<PickerItemValue<TItem>>,
): Array<TItem | undefined> {
  return columns.map((column, columnIndex) =>
    column.find(item => item.value === pickerValue[columnIndex]),
  );
}

function getSelectedIndexes<TItem extends PickerColumnItemData>(
  columns: Array<PickerColumn<TItem>>,
  pickerValue: Array<PickerItemValue<TItem>>,
): number[] {
  return columns.map((column, columnIndex) =>
    column.findIndex(item => item.value === pickerValue[columnIndex]),
  );
}

function hasEmptyColumn<TItem extends PickerColumnItemData>(
  columns: Array<PickerColumn<TItem>>,
): boolean {
  return columns.some(column => column.length === 0);
}

function updateFocusIndex<TItem extends PickerColumnItemData>(
  currentIndexes: number[],
  columns: Array<PickerColumn<TItem>>,
  columnIndex: number,
  itemIndex: number,
): number[] {
  const baseIndexes = currentIndexes.length === columns.length
    ? currentIndexes
    : getSelectedIndexes(columns, []);

  return baseIndexes.map((value, index) => (index === columnIndex ? itemIndex : value));
}

function getItemDisplayText<TItem extends PickerColumnItemData>(
  item: TItem | undefined,
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

function getTriggerValueText<TItem extends PickerColumnItemData>(
  columns: Array<PickerColumn<TItem>>,
  pickerValue: Array<PickerItemValue<TItem>>,
): string | undefined {
  const itemTexts = getSelectedItems(columns, pickerValue)
    .map(item => getItemDisplayText(item))
    .filter((item): item is string => item !== undefined);

  if (itemTexts.length === 0) {
    return undefined;
  }

  return itemTexts.join(' / ');
}

export function Picker<TItem extends PickerColumnItemData = PickerColumnItemData>({
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
  size = DEFAULT_SIZE,
  style,
  triggerStyle,
  value,
}: PickerProps<TItem>) {
  const tokenStyles = usePickerStyles({ size });
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const [mainValue = [], setMainValue] = useControllableValue<
    Array<PickerItemValue<TItem>>
  >(
    getInitialValue(defaultValue, value),
    value,
    undefined,
  );
  const [draftValue, setDraftValue] = useState(mainValue);
  const [focusedIndexes, setFocusedIndexes] = useState<number[]>(() =>
    getSelectedIndexes(columns, mainValue),
  );
  const [isWheelScrolling, setIsWheelScrolling] = useState(false);
  const draftValueRef = useRef(draftValue);
  const triggerValueText = getTriggerValueText(columns, mainValue);
  const hasMainValue = mainValue.length > 0;
  const hasDisabledFocusedItem = focusedIndexes.some((itemIndex, columnIndex) => {
    if (itemIndex < 0) {
      return false;
    }

    return columns[columnIndex]?.[itemIndex]?.disabled === true;
  });
  const okDisabled = popupProps?.okDisabled === true || hasDisabledFocusedItem;

  useEffect(() => {
    if (isOpen) {
      setDraftValue(mainValue);
      draftValueRef.current = mainValue;
      setFocusedIndexes(getSelectedIndexes(columns, mainValue));
      setIsWheelScrolling(false);
    }
  }, [columns, isOpen, mainValue]);

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

    if (!popupProps?.loading && !hasEmptyColumn(columns)) {
      closeInternal('ok');
    }
  };

  const handleItemPress = (columnIndex: number, itemIndex: number) => {
    setFocusedIndexes(currentIndexes =>
      updateFocusIndex(currentIndexes, columns, columnIndex, itemIndex),
    );

    const item = columns[columnIndex]?.[itemIndex];

    if (item === undefined || item.disabled) {
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

  const handleWheelFocusChange = (columnIndex: number, itemIndex: number) => {
    setFocusedIndexes(currentIndexes =>
      updateFocusIndex(currentIndexes, columns, columnIndex, itemIndex),
    );
  };

  const handleClearPress = () => {
    const nextValue: Array<PickerItemValue<TItem>> = [];
    draftValueRef.current = nextValue;
    setDraftValue(nextValue);
    setMainValue(nextValue);
    setFocusedIndexes(getSelectedIndexes(columns, nextValue));
    onClear?.();
    onChange?.(nextValue, {
      reason: 'clear',
      items: getSelectedItems(columns, nextValue),
    });
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
        styles={tokenStyles}
        triggerStyle={triggerStyle}
        valueText={triggerValueText}
      >
        {children}
      </PickerTrigger>
      <PickerPopup
        columns={columns}
        draftValue={draftValue}
        hasDisabledFocusedItem={hasDisabledFocusedItem}
        isWheelScrolling={isWheelScrolling}
        onItemPress={handleItemPress}
        open={isOpen}
        onCancelPress={handleCancelPress}
        onFocusIndexChange={handleWheelFocusChange}
        onMaskPress={handleMaskPress}
        onOkPress={handleOkPress}
        onWheelScrollStateChange={setIsWheelScrolling}
        props={{
          ...popupProps,
          okDisabled,
          cancelText: popupProps?.cancelText ?? DEFAULT_CANCEL_TEXT,
          okText: popupProps?.okText ?? DEFAULT_OK_TEXT,
        }}
        styles={tokenStyles}
      />
    </View>
  );
}
