import React, { useMemo } from 'react';
import { Picker } from '../Picker';
import { formatDateValue } from '../CalendarPicker/dateValue';
import {
  formatTimeDateValue,
  formatTimeValueText,
  padTimeValue,
} from './timeColumns';
import {
  getColumnTypes,
  getDatePrecision,
  getTimePrecision,
  hasDatePart,
  hasTimePart,
  normalizePrecision,
} from './precision';
import type {
  PickerColumn,
  PickerColumnItemData,
  PickerValue,
} from '../Picker';
import type { DateTimePickerCoreProps } from './DateTimePickerCore';
import type {
  DateTimePickerColumnType,
  DateTimePickerLabelParams,
  DateTimePickerValueParams,
} from './types';

const DEFAULT_STEP = 1;
const DEFAULT_YEAR_RANGE = 10;
const MAX_HOUR = 23;
const MAX_MINUTE_OR_SECOND = 59;
const MONTH_COUNT = 12;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getBaseDate(props: DateTimePickerCoreProps): Date {
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
  columnTypes: DateTimePickerColumnType[],
): PickerValue[] {
  return columnTypes.map(type => {
    if (type === 'year') return date.getFullYear();
    if (type === 'month') return date.getMonth() + 1;
    if (type === 'day') return date.getDate();
    if (type === 'hour') return date.getHours();
    if (type === 'minute') return date.getMinutes();

    return date.getSeconds();
  });
}

function pickerValueToDate(
  pickerValue: PickerValue[],
  columnTypes: DateTimePickerColumnType[],
  baseDate: Date,
): Date {
  const values: Partial<Record<DateTimePickerColumnType, number>> = {};

  columnTypes.forEach((type, index) => {
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

function buildValueParams(date: Date): DateTimePickerValueParams {
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
    return String(value);
  }

  return padTimeValue(value);
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
  const day = Math.min(
    type === 'day' ? value : baseDate.getDate(),
    maxDay,
  );
  const hours = type === 'hour' ? value : baseDate.getHours();
  const minutes = type === 'minute' ? value : baseDate.getMinutes();
  const seconds = type === 'second' ? value : baseDate.getSeconds();

  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}

interface BuildColumnContext {
  baseDate: Date;
  min?: Date;
  max?: Date;
  disabledDate?: (date: Date) => boolean;
  formatLabel?: DateTimePickerCoreProps['formatLabel'];
}

function isCandidateDisabled(
  candidate: Date,
  min: Date | undefined,
  max: Date | undefined,
  disabledDate: ((date: Date) => boolean) | undefined,
): boolean {
  if (min && candidate.getTime() < min.getTime()) {
    return true;
  }

  if (max && candidate.getTime() > max.getTime()) {
    return true;
  }

  return disabledDate?.(candidate) === true;
}

function buildColumn(
  type: DateTimePickerColumnType,
  values: number[],
  context: BuildColumnContext,
): PickerColumn {
  const column: PickerColumn = [];

  for (const value of values) {
    const candidate = buildCandidateDate(type, value, context.baseDate);
    const disabled = isCandidateDisabled(
      candidate,
      context.min,
      context.max,
      context.disabledDate,
    );
    const labelText = context.formatLabel
      ? context.formatLabel(value, { type, value, date: candidate })
      : defaultLabelText(type, value);

    column.push({ value, labelText, disabled });
  }

  return column;
}

function rangeValues(start: number, end: number, step = DEFAULT_STEP): number[] {
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
  if (type === 'minute') {
    return minuteStep ?? DEFAULT_STEP;
  }

  if (type === 'second') {
    return secondStep ?? DEFAULT_STEP;
  }

  return DEFAULT_STEP;
}

function buildColumnsForType(
  type: DateTimePickerColumnType,
  context: BuildColumnContext,
  minuteStep: number | undefined,
  secondStep: number | undefined,
): PickerColumn {
  if (type === 'year') {
    const { start, end } = getYearRange(
      context.baseDate,
      context.min,
      context.max,
    );

    return buildColumn(type, rangeValues(start, end), context);
  }

  if (type === 'month') {
    return buildColumn(type, rangeValues(1, MONTH_COUNT), context);
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

  return buildColumn(
    type,
    rangeValues(
      0,
      MAX_MINUTE_OR_SECOND,
      getStepForType(type, minuteStep, secondStep),
    ),
    context,
  );
}

/**
 * 滚轮布局：按 parts 与 precision 组合年/月/日/时/分/秒列。
 */
export function DateTimeWheelPicker(props: DateTimePickerCoreProps) {
  const precision = normalizePrecision(props.parts, props.precision);
  const columnTypes = useMemo(
    () => getColumnTypes(props.parts, precision),
    [props.parts, precision],
  );
  const baseDate = getBaseDate(props);
  const baseTime = baseDate.getTime();
  const minTime = props.min?.getTime();
  const maxTime = props.max?.getTime();
  const { disabledDate, formatLabel, minuteStep, renderLabel, secondStep } = props;
  // 仅日期相关的 parts 才需要按天禁用候选值。
  const candidateDisabledDate = hasDatePart(props.parts, precision)
    ? disabledDate
    : undefined;

  const columns = useMemo(() => {
    const context: BuildColumnContext = {
      baseDate: new Date(baseTime),
      min: minTime === undefined ? undefined : new Date(minTime),
      max: maxTime === undefined ? undefined : new Date(maxTime),
      disabledDate: candidateDisabledDate,
      formatLabel,
    };

    return columnTypes.map(type =>
      buildColumnsForType(type, context, minuteStep, secondStep),
    );
  }, [
    candidateDisabledDate,
    columnTypes,
    baseTime,
    minTime,
    maxTime,
    formatLabel,
    minuteStep,
    secondStep,
  ]);

  const pickerValue = props.value
    ? dateToPickerValue(props.value, columnTypes)
    : undefined;
  const defaultPickerValue = props.defaultValue
    ? dateToPickerValue(props.defaultValue, columnTypes)
    : undefined;

  const pickerRenderLabel = renderLabel
    ? (item: PickerColumnItemData, columnIndex: number) => {
        const type = columnTypes[columnIndex];
        const value = Number(item.value);
        const candidate = buildCandidateDate(type, value, baseDate);
        const params: DateTimePickerLabelParams = { type, value, date: candidate };

        return renderLabel(params);
      }
    : undefined;

  const formatValueText = (nextPickerValue: PickerValue[]): string | undefined => {
    if (nextPickerValue.length === 0) {
      return undefined;
    }

    if (props.parts === 'time') {
      return formatTimeValueText(
        nextPickerValue,
        baseDate,
        getTimePrecision(precision),
      );
    }

    const nextDate = pickerValueToDate(nextPickerValue, columnTypes, baseDate);
    const dateText = formatDateValue(nextDate, getDatePrecision(precision));

    if (!hasTimePart(props.parts, precision)) {
      return dateText;
    }

    return `${dateText} ${formatTimeDateValue(
      nextDate,
      getTimePrecision(precision),
    )}`;
  };

  return (
    <Picker
      columns={columns}
      defaultOpen={props.defaultOpen}
      defaultValue={defaultPickerValue}
      disabled={props.disabled}
      displayInputProps={props.displayInputProps}
      formatValueText={formatValueText}
      label={props.label}
      labelText={props.labelText}
      onCancel={props.onCancel}
      onChange={nextPickerValue => {
        const nextDate = pickerValueToDate(
          nextPickerValue,
          columnTypes,
          baseDate,
        );
        props.onChange?.(nextDate, buildValueParams(nextDate));
      }}
      onOk={nextPickerValue => {
        const nextDate = pickerValueToDate(
          nextPickerValue,
          columnTypes,
          baseDate,
        );
        props.onOk?.(nextDate, buildValueParams(nextDate));
      }}
      onOpenChange={props.onOpenChange}
      open={props.open}
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
      readonly={props.readonly}
      size={props.size}
      style={props.style}
      styles={props.styles ? {
        trigger: props.styles.trigger,
        input: props.styles.input,
        popup: props.styles.popup,
        panel: props.styles.panel,
      } : undefined}
      value={pickerValue}
    >
      {props.children}
    </Picker>
  );
}
