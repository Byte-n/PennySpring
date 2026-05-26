import React, { useMemo } from 'react';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerValue,
} from '../Picker';
import { Picker } from '../Picker';
import type {
  TimePickerColumnType,
  TimePickerPrecision,
  TimePickerProps,
  TimePickerValueParams,
} from './types';

const DEFAULT_PRECISION: TimePickerPrecision = 'minute';
const DEFAULT_STEP = 1;
const MAX_HOUR = 23;
const MAX_MINUTE_OR_SECOND = 59;

function padTimeValue(value: number): string {
  return String(value).padStart(2, '0');
}

function getColumnTypes(precision: TimePickerPrecision): TimePickerColumnType[] {
  if (precision === 'hour') {
    return ['hour'];
  }

  if (precision === 'minute') {
    return ['hour', 'minute'];
  }

  return ['hour', 'minute', 'second'];
}

function getBaseDate(props: TimePickerProps): Date {
  if (props.value) {
    return new Date(props.value);
  }

  if (props.defaultValue) {
    return new Date(props.defaultValue);
  }

  if (props.min) {
    return new Date(props.min);
  }

  return new Date();
}

function dateToPickerValue(
  date: Date,
  precision: TimePickerPrecision,
): PickerValue[] {
  const values: PickerValue[] = [date.getHours()];

  if (precision !== 'hour') {
    values.push(date.getMinutes());
  }

  if (precision === 'second') {
    values.push(date.getSeconds());
  }

  return values;
}

function pickerValueToDate(
  pickerValue: PickerValue[],
  baseDate: Date,
  precision: TimePickerPrecision,
): Date {
  const next = new Date(baseDate);
  const hours = Number(pickerValue[0] ?? 0);
  const minutes = precision === 'hour' ? 0 : Number(pickerValue[1] ?? 0);
  const seconds = precision === 'second' ? Number(pickerValue[2] ?? 0) : 0;

  next.setHours(hours, minutes, seconds, 0);
  return next;
}

function buildTimeParams(date: Date): TimePickerValueParams {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    date,
  };
}

function defaultLabelText(type: TimePickerColumnType, value: number): string {
  const padded = padTimeValue(value);
  return padded + '';
}

function formatTimeValueText(
  pickerValue: PickerValue[],
  baseDate: Date,
  precision: TimePickerPrecision,
): string | undefined {
  if (pickerValue.length === 0) {
    return undefined;
  }

  const date = pickerValueToDate(pickerValue, baseDate, precision);
  const values = [padTimeValue(date.getHours())];

  if (precision !== 'hour') {
    values.push(padTimeValue(date.getMinutes()));
  }

  if (precision === 'second') {
    values.push(padTimeValue(date.getSeconds()));
  }

  return values.join(':');
}

function getCandidateDate(
  type: TimePickerColumnType,
  value: number,
  baseDate: Date,
  precision: TimePickerPrecision,
): Date {
  const candidate = new Date(baseDate);

  if (type === 'hour') {
    candidate.setHours(value);
  } else if (type === 'minute') {
    candidate.setMinutes(value);
  } else {
    candidate.setSeconds(value);
  }

  if (precision === 'hour') {
    candidate.setMinutes(0, 0, 0);
  } else if (precision === 'minute') {
    candidate.setSeconds(0, 0);
  } else {
    candidate.setMilliseconds(0);
  }

  return candidate;
}

function buildColumn(
  type: TimePickerColumnType,
  step: number,
  baseDate: Date,
  precision: TimePickerPrecision,
  min: Date | undefined,
  max: Date | undefined,
  formatLabel: TimePickerProps['formatLabel'],
): PickerColumn {
  const maxValue = type === 'hour' ? MAX_HOUR : MAX_MINUTE_OR_SECOND;
  const column: PickerColumn = [];
  const safeStep = step > 0 ? step : DEFAULT_STEP;

  for (let value = 0; value <= maxValue; value += safeStep) {
    const candidate = getCandidateDate(type, value, baseDate, precision);
    const disabled =
      (min !== undefined && candidate.getTime() < min.getTime()) ||
      (max !== undefined && candidate.getTime() > max.getTime());

    const labelText = formatLabel
      ? formatLabel(value, { type, value, date: candidate })
      : defaultLabelText(type, value);

    column.push({ value, labelText, disabled });
  }

  return column;
}

function getStepForType(
  type: TimePickerColumnType,
  props: TimePickerProps,
): number {
  if (type === 'minute') {
    return props.minuteStep ?? DEFAULT_STEP;
  }

  if (type === 'second') {
    return props.secondStep ?? DEFAULT_STEP;
  }

  return DEFAULT_STEP;
}

export function TimePicker(props: TimePickerProps) {
  const precision = props.precision ?? DEFAULT_PRECISION;
  const columnTypes = useMemo(() => getColumnTypes(precision), [precision]);
  const baseDate = getBaseDate(props);
  const baseTime = baseDate.getTime();
  const minTime = props.min?.getTime();
  const maxTime = props.max?.getTime();
  const { formatLabel, renderLabel, minuteStep, secondStep } = props;

  const columns = useMemo(() => {
    return columnTypes.map(type => {
      const step = getStepForType(type, { minuteStep, secondStep });
      return buildColumn(
        type,
        step,
        new Date(baseTime),
        precision,
        minTime === undefined ? undefined : new Date(minTime),
        maxTime === undefined ? undefined : new Date(maxTime),
        formatLabel,
      );
    });
  }, [columnTypes, baseTime, precision, minTime, maxTime, formatLabel, minuteStep, secondStep]);

  const pickerValue = props.value
    ? dateToPickerValue(props.value, precision)
    : undefined;
  const defaultPickerValue = props.defaultValue
    ? dateToPickerValue(props.defaultValue, precision)
    : dateToPickerValue(baseDate, precision);

  const pickerRenderLabel = renderLabel
    ? (item: PickerColumnItemData, columnIndex: number) => {
        const type = columnTypes[columnIndex];
        const value = Number(item.value);
        const candidate = getCandidateDate(type, value, baseDate, precision);
        return renderLabel({ type, value, date: candidate });
      }
    : undefined;

  return (
    <Picker
      columns={columns}
      defaultOpen={props.defaultOpen}
      defaultValue={defaultPickerValue}
      disabled={props.disabled}
      displayInputProps={props.displayInputProps}
      formatValueText={nextPickerValue =>
        formatTimeValueText(nextPickerValue, baseDate, precision)
      }
      onCancel={props.onCancel}
      onChange={nextPickerValue => {
        const nextDate = pickerValueToDate(nextPickerValue, baseDate, precision);
        props.onChange?.(nextDate, buildTimeParams(nextDate));
      }}
      onOk={nextPickerValue => {
        const nextDate = pickerValueToDate(nextPickerValue, baseDate, precision);
        props.onOk?.(nextDate, buildTimeParams(nextDate));
      }}
      onOpenChange={props.onOpenChange}
      open={props.open}
      placeholder={props.placeholder}
      popupProps={{
        cancel: props.cancel,
        cancelText: props.cancelText,
        empty: props.empty,
        emptyText: props.emptyText,
        loading: props.loading,
        loadingIndicator: props.loadingIndicator,
        loadingIndicatorText: props.loadingIndicatorText,
        ok: props.ok,
        okDisabled: props.okDisabled,
        okText: props.okText,
        renderLabel: pickerRenderLabel,
        title: props.title,
        titleText: props.titleText,
      }}
      style={props.style}
      styles={props.styles}
      value={pickerValue}
    >
      {props.children}
    </Picker>
  );
}
