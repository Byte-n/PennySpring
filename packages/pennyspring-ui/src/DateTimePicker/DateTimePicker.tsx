import React, { useMemo } from 'react';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerValue,
} from '../Picker';
import { Picker } from '../Picker';
import type {
  DateTimePickerColumnType,
  DateTimePickerLabelParams,
  DateTimePickerPrecision,
  DateTimePickerProps,
  DateTimePickerValueParams,
} from './types';

const DEFAULT_PRECISION: DateTimePickerPrecision = 'minute';
const DEFAULT_STEP = 1;
const DEFAULT_YEAR_RANGE = 10;
const MAX_HOUR = 23;
const MAX_MINUTE_OR_SECOND = 59;

function padDateTimeValue(value: number): string {
  return String(value).padStart(2, '0');
}

function getColumnTypes(precision: DateTimePickerPrecision): DateTimePickerColumnType[] {
  switch (precision) {
    case 'year':
      return ['year'];
    case 'month':
      return ['year', 'month'];
    case 'day':
      return ['year', 'month', 'day'];
    case 'hour':
      return ['year', 'month', 'day', 'hour'];
    case 'minute':
      return ['year', 'month', 'day', 'hour', 'minute'];
    case 'second':
      return ['year', 'month', 'day', 'hour', 'minute', 'second'];
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getBaseDate(props: DateTimePickerProps): Date {
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
  precision: DateTimePickerPrecision,
): PickerValue[] {
  const types = getColumnTypes(precision);
  const values: PickerValue[] = [];

  for (const type of types) {
    if (type === 'year') values.push(date.getFullYear());
    else if (type === 'month') values.push(date.getMonth() + 1);
    else if (type === 'day') values.push(date.getDate());
    else if (type === 'hour') values.push(date.getHours());
    else if (type === 'minute') values.push(date.getMinutes());
    else values.push(date.getSeconds());
  }

  return values;
}

function pickerValueToDate(
  pickerValue: PickerValue[],
  precision: DateTimePickerPrecision,
  baseDate: Date,
): Date {
  const types = getColumnTypes(precision);
  const values: Partial<Record<DateTimePickerColumnType, number>> = {};

  types.forEach((type, index) => {
    const raw = pickerValue[index];
    if (raw !== undefined) {
      values[type] = Number(raw);
    }
  });

  const year = values.year ?? baseDate.getFullYear();
  const month = values.month ?? baseDate.getMonth() + 1;
  const maxDay = getDaysInMonth(year, month);
  const day = Math.min(values.day ?? baseDate.getDate(), maxDay);
  const hours = values.hour ?? 0;
  const minutes = values.minute ?? 0;
  const seconds = values.second ?? 0;

  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}

function buildDateTimeParams(date: Date): DateTimePickerValueParams {
  return {
    date,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

function defaultLabelText(type: DateTimePickerColumnType, value: number): string {
  if (type === 'year') {
    return value + '';
  }

  const padded = padDateTimeValue(value);

  return padded + '';
}

function formatDateTimeValueText(
  pickerValue: PickerValue[],
  precision: DateTimePickerPrecision,
  baseDate: Date,
): string | undefined {
  if (pickerValue.length === 0) {
    return undefined;
  }

  const date = pickerValueToDate(pickerValue, precision, baseDate);
  const dateParts = [String(date.getFullYear())];

  if (precision !== 'year') {
    dateParts.push(padDateTimeValue(date.getMonth() + 1));
  }

  if (
    precision === 'day' ||
    precision === 'hour' ||
    precision === 'minute' ||
    precision === 'second'
  ) {
    dateParts.push(padDateTimeValue(date.getDate()));
  }

  if (precision === 'year' || precision === 'month' || precision === 'day') {
    return dateParts.join('-');
  }

  const timeParts = [padDateTimeValue(date.getHours())];

  if (precision === 'minute' || precision === 'second') {
    timeParts.push(padDateTimeValue(date.getMinutes()));
  }

  if (precision === 'second') {
    timeParts.push(padDateTimeValue(date.getSeconds()));
  }

  return `${dateParts.join('-')} ${timeParts.join(':')}`;
}

function getYearRange(
  baseDate: Date,
  min: Date | undefined,
  max: Date | undefined,
): { start: number; end: number } {
  const baseYear = baseDate.getFullYear();
  const start = min ? min.getFullYear() : baseYear - DEFAULT_YEAR_RANGE;
  const end = max ? max.getFullYear() : baseYear + DEFAULT_YEAR_RANGE;

  return { start, end };
}

function buildCandidateDate(
  type: DateTimePickerColumnType,
  value: number,
  baseDate: Date,
): Date {
  const year = type === 'year' ? value : baseDate.getFullYear();
  const month = type === 'month' ? value : baseDate.getMonth() + 1;
  const maxDay = getDaysInMonth(year, month);
  const rawDay = type === 'day' ? value : baseDate.getDate();
  const day = Math.min(rawDay, maxDay);
  const hours = type === 'hour' ? value : baseDate.getHours();
  const minutes = type === 'minute' ? value : baseDate.getMinutes();
  const seconds = type === 'second' ? value : baseDate.getSeconds();

  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}

function isCandidateDisabled(
  candidate: Date,
  min: Date | undefined,
  max: Date | undefined,
): boolean {
  if (min && candidate.getTime() < min.getTime()) {
    return true;
  }

  if (max && candidate.getTime() > max.getTime()) {
    return true;
  }

  return false;
}

interface BuildColumnContext {
  baseDate: Date;
  min?: Date;
  max?: Date;
  formatLabel?: DateTimePickerProps['formatLabel'];
}

function buildColumn(
  type: DateTimePickerColumnType,
  values: number[],
  context: BuildColumnContext,
): PickerColumn {
  const column: PickerColumn = [];

  for (const value of values) {
    const candidate = buildCandidateDate(type, value, context.baseDate);
    const disabled = isCandidateDisabled(candidate, context.min, context.max);
    const labelText = context.formatLabel
      ? context.formatLabel(value, { type, value, date: candidate })
      : defaultLabelText(type, value);

    column.push({ value, labelText, disabled });
  }

  return column;
}

function rangeValues(start: number, end: number, step = 1): number[] {
  const values: number[] = [];
  const safeStep = step > 0 ? step : DEFAULT_STEP;

  for (let value = start; value <= end; value += safeStep) {
    values.push(value);
  }

  return values;
}

function getStepForType(
  type: DateTimePickerColumnType,
  minuteStep: number | undefined,
  secondStep: number | undefined,
): number {
  if (type === 'minute') return minuteStep ?? DEFAULT_STEP;
  if (type === 'second') return secondStep ?? DEFAULT_STEP;
  return DEFAULT_STEP;
}

function buildColumnsForType(
  type: DateTimePickerColumnType,
  context: BuildColumnContext,
  minuteStep: number | undefined,
  secondStep: number | undefined,
): PickerColumn {
  if (type === 'year') {
    const { start, end } = getYearRange(context.baseDate, context.min, context.max);
    return buildColumn(type, rangeValues(start, end), context);
  }

  if (type === 'month') {
    return buildColumn(type, rangeValues(1, 12), context);
  }

  if (type === 'day') {
    const maxDay = getDaysInMonth(
      context.baseDate.getFullYear(),
      context.baseDate.getMonth() + 1,
    );
    return buildColumn(type, rangeValues(1, maxDay), context);
  }

  if (type === 'hour') {
    return buildColumn(type, rangeValues(0, MAX_HOUR), context);
  }

  const step = getStepForType(type, minuteStep, secondStep);
  return buildColumn(type, rangeValues(0, MAX_MINUTE_OR_SECOND, step), context);
}

export function DateTimePicker(props: DateTimePickerProps) {
  const precision = props.precision ?? DEFAULT_PRECISION;
  const columnTypes = useMemo(() => getColumnTypes(precision), [precision]);
  const baseDate = getBaseDate(props);
  const baseTime = baseDate.getTime();
  const minTime = props.min?.getTime();
  const maxTime = props.max?.getTime();
  const { formatLabel, renderLabel, minuteStep, secondStep } = props;

  const columns = useMemo(() => {
    const context: BuildColumnContext = {
      baseDate: new Date(baseTime),
      min: minTime === undefined ? undefined : new Date(minTime),
      max: maxTime === undefined ? undefined : new Date(maxTime),
      formatLabel,
    };

    return columnTypes.map(type =>
      buildColumnsForType(type, context, minuteStep, secondStep),
    );
  }, [columnTypes, baseTime, minTime, maxTime, formatLabel, minuteStep, secondStep]);

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
        const candidate = buildCandidateDate(type, value, baseDate);
        const params: DateTimePickerLabelParams = { type, value, date: candidate };
        return renderLabel(params);
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
        formatDateTimeValueText(nextPickerValue, precision, baseDate)
      }
      onCancel={props.onCancel}
      onChange={nextPickerValue => {
        const nextDate = pickerValueToDate(nextPickerValue, precision, baseDate);
        props.onChange?.(nextDate, buildDateTimeParams(nextDate));
      }}
      onOk={nextPickerValue => {
        const nextDate = pickerValueToDate(nextPickerValue, precision, baseDate);
        props.onOk?.(nextDate, buildDateTimeParams(nextDate));
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
