import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarPickerSheet } from './CalendarPickerSheet';
import { CalendarPickerView } from './CalendarPickerView';
import {
  formatDateValue,
  getCalendarViewMode,
  parseDateValue,
  startOfDay,
  toCalendarViewValue,
} from './dateValue';
import { PickerTrigger } from '../_internal/PickerTrigger';
import { useControllableValue } from '../_hooks';
import type { CalendarPickerViewRangeValue } from './types';
import type { ComponentSize } from '../shares/types';
import type {
  CalendarPickerPrecision,
  CalendarPickerRangeProps,
} from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_PRECISION: CalendarPickerPrecision = 'day';
const RANGE_SEPARATOR = ' - ';

type DateRange = [Date, Date];

/** 范围选择只处理日期，提交值统一把时分秒归零。 */
function normalizeRange(range: DateRange | undefined): DateRange | undefined {
  if (!range) {
    return undefined;
  }

  return [startOfDay(range[0]), startOfDay(range[1])];
}

function formatRangeText(
  range: DateRange | undefined,
  precision: CalendarPickerPrecision,
): string | undefined {
  if (!range) {
    return undefined;
  }

  return `${formatDateValue(range[0], precision)}${RANGE_SEPARATOR}${formatDateValue(range[1], precision)}`;
}

/**
 * 输入型范围选择：触发器 + 底部浮层，面板内选择只更新草稿，确定后才提交。
 */
export function CalendarPickerRange(props: CalendarPickerRangeProps) {
  const size = props.size ?? DEFAULT_SIZE;
  const precision = props.precision ?? DEFAULT_PRECISION;
  const mode = getCalendarViewMode(precision);

  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    props.defaultOpen === true,
    props.open,
    undefined,
  );
  const isOpen = resolvedOpen === true;

  const [committedValue, setCommittedValue] = useControllableValue<
    DateRange | undefined
  >(props.defaultValue, props.value, undefined);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(
    () => normalizeRange(committedValue),
  );
  const previousOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !previousOpenRef.current) {
      setDraftRange(normalizeRange(committedValue));
    }

    previousOpenRef.current = isOpen;
  }, [committedValue, isOpen]);

  const fallbackDate = committedValue?.[0];
  const fallbackTimestamp = fallbackDate?.getTime();

  const panelValue = draftRange
    ? [
      toCalendarViewValue(draftRange[0], precision),
      toCalendarViewValue(draftRange[1], precision),
    ] as CalendarPickerViewRangeValue
    : undefined;
  const minDate = props.min
    ? formatDateValue(props.min, precision)
    : undefined;
  const maxDate = props.max
    ? formatDateValue(props.max, precision)
    : undefined;
  const marks = useMemo(
    () => props.marks?.map(mark => ({
      date: formatDateValue(mark.date, precision),
      content: mark.content,
    })),
    [precision, props.marks],
  );
  // 面板只处理字符串值，这里把字符串还原成 Date 后交给外部禁用判断。
  const disabledDate = useMemo(
    () => props.disabledDate
      ? (value: string) => props.disabledDate!(
        parseDateValue(
          value,
          fallbackTimestamp === undefined ? new Date() : new Date(fallbackTimestamp),
        ),
      )
      : undefined,
    [fallbackTimestamp, props.disabledDate],
  );

  function handleTriggerPress() {
    if (props.disabled || props.readonly) {
      return;
    }

    setDraftRange(normalizeRange(committedValue));
    setResolvedOpen(true);
    props.onOpenChange?.(true, { reason: 'trigger' });
  }

  function closePanel(reason: 'cancel' | 'mask' | 'ok') {
    setResolvedOpen(false);
    props.onOpenChange?.(false, { reason });
  }

  function discardDraft() {
    setDraftRange(committedValue);
  }

  function handlePanelChange(nextValue: CalendarPickerViewRangeValue) {
    const fallback = fallbackDate ?? new Date();
    const nextRange: DateRange = [
      startOfDay(parseDateValue(nextValue[0], fallback)),
      startOfDay(parseDateValue(nextValue[1], fallback)),
    ];

    setDraftRange(nextRange);
    props.onChange?.(nextRange);
  }

  function handleCancelPress() {
    props.onCancel?.({ reason: 'cancel' });
    discardDraft();
    closePanel('cancel');
  }

  function handleMaskPress() {
    props.onCancel?.({ reason: 'mask' });
    discardDraft();
  }

  function handleClearPress() {
    if (props.disabled || props.readonly) {
      return;
    }

    setCommittedValue(undefined);
    setDraftRange(undefined);
    props.onClear?.();
  }

  function handleOkPress() {
    if (props.disabled || props.okDisabled === true || !draftRange) {
      return;
    }

    setCommittedValue(draftRange);
    props.onOk?.(draftRange);
    closePanel('ok');
  }

  return (
    <>
      <PickerTrigger
        active={isOpen && props.status !== 'error'}
        allowClear={props.allowClear}
        disabled={props.disabled}
        displayInputProps={props.displayInputProps}
        error={props.error}
        errorText={props.errorText}
        externalInputStyles={props.styles?.input}
        externalTriggerStyle={[props.styles?.trigger, props.style]}
        hasValue={committedValue !== undefined}
        helper={props.helper}
        helperText={props.helperText}
        label={props.label ?? props.labelText}
        onClearPress={handleClearPress}
        onPress={handleTriggerPress}
        readonly={props.readonly}
        size={size}
        status={props.status}
        valueText={formatRangeText(committedValue, precision)}
      >
        {props.children}
      </PickerTrigger>
      <CalendarPickerSheet
        cancel={props.cancel}
        cancelText={props.cancelText}
        ok={props.ok}
        okDisabled={props.okDisabled}
        okText={props.okText}
        onCancelPress={handleCancelPress}
        onMaskPress={handleMaskPress}
        onOkPress={handleOkPress}
        onOpenChange={nextOpen => {
          if (nextOpen) {
            return;
          }

          closePanel('mask');
        }}
        open={isOpen}
        panelStyles={props.styles?.panel}
        popupStyles={props.styles?.popup}
        size={size}
        title={props.title}
        titleText={props.titleText}
      >
        <CalendarPickerView.Range
          disabled={props.disabled}
          disabledDate={disabledDate}
          marks={marks}
          maxDate={maxDate}
          minDate={minDate}
          mode={mode}
          onChange={handlePanelChange}
          readonly={props.readonly}
          showValue={false}
          size={size}
          styles={props.styles?.calendar}
          value={panelValue}
        />
      </CalendarPickerSheet>
    </>
  );
}
