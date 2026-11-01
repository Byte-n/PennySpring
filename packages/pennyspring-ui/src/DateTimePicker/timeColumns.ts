import type { PickerColumn, PickerValue } from '../Picker';
import type {
  DateTimePickerColumnType,
  DateTimePickerLabelParams,
  DateTimePickerTimePrecision,
} from './types';

type FormatLabel = (value: number, params: DateTimePickerLabelParams) => string;

const DEFAULT_STEP = 1;
const MAX_HOUR = 23;
const MAX_MINUTE_OR_SECOND = 59;

export function padTimeValue(value: number): string {
  return String(value).padStart(2, '0');
}

export function getTimeColumnTypes(
  precision: DateTimePickerTimePrecision,
): DateTimePickerColumnType[] {
  if (precision === 'hour') {
    return ['hour'];
  }

  if (precision === 'minute') {
    return ['hour', 'minute'];
  }

  return ['hour', 'minute', 'second'];
}

export function dateToTimePickerValue(
  date: Date,
  precision: DateTimePickerTimePrecision,
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

export function pickerValueToTimeDate(
  pickerValue: PickerValue[],
  baseDate: Date,
  precision: DateTimePickerTimePrecision,
): Date {
  const next = new Date(baseDate);
  const hours = Number(pickerValue[0] ?? 0);
  const minutes = precision === 'hour' ? 0 : Number(pickerValue[1] ?? 0);
  const seconds = precision === 'second' ? Number(pickerValue[2] ?? 0) : 0;

  next.setHours(hours, minutes, seconds, 0);
  return next;
}

/** 按时间精度格式化 Date 的时间部分。 */
export function formatTimeDateValue(
  date: Date,
  precision: DateTimePickerTimePrecision,
): string {
  const values = [padTimeValue(date.getHours())];

  if (precision !== 'hour') {
    values.push(padTimeValue(date.getMinutes()));
  }

  if (precision === 'second') {
    values.push(padTimeValue(date.getSeconds()));
  }

  return values.join(':');
}

export function formatTimeValueText(
  pickerValue: PickerValue[],
  baseDate: Date,
  precision: DateTimePickerTimePrecision,
): string | undefined {
  if (pickerValue.length === 0) {
    return undefined;
  }

  return formatTimeDateValue(
    pickerValueToTimeDate(pickerValue, baseDate, precision),
    precision,
  );
}

function defaultLabelText(
  type: DateTimePickerColumnType,
  value: number,
): string {
  return padTimeValue(value);
}

export function getTimeCandidateDate(
  type: DateTimePickerColumnType,
  value: number,
  baseDate: Date,
  precision: DateTimePickerTimePrecision,
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

interface BuildTimeColumnOptions {
  baseDate: Date;
  disabledDate?: (date: Date) => boolean;
  formatLabel?: FormatLabel;
  max?: Date;
  min?: Date;
  precision: DateTimePickerTimePrecision;
  step: number;
}

function buildColumn(
  type: DateTimePickerColumnType,
  options: BuildTimeColumnOptions,
): PickerColumn {
  const maxValue = type === 'hour' ? MAX_HOUR : MAX_MINUTE_OR_SECOND;
  const column: PickerColumn = [];
  const safeStep = options.step > 0 ? options.step : DEFAULT_STEP;

  for (let value = 0; value <= maxValue; value += safeStep) {
    const candidate = getTimeCandidateDate(
      type,
      value,
      options.baseDate,
      options.precision,
    );
    const disabled =
      (options.min !== undefined &&
        candidate.getTime() < options.min.getTime()) ||
      (options.max !== undefined &&
        candidate.getTime() > options.max.getTime()) ||
      options.disabledDate?.(candidate) === true;

    const labelText = options.formatLabel
      ? options.formatLabel(value, { type, value, date: candidate })
      : defaultLabelText(type, value);

    column.push({ value, labelText, disabled });
  }

  return column;
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

export interface BuildTimeColumnsOptions {
  baseDate: Date;
  disabledDate?: (date: Date) => boolean;
  formatLabel?: FormatLabel;
  max?: Date;
  min?: Date;
  minuteStep?: number;
  precision: DateTimePickerTimePrecision;
  secondStep?: number;
}

export function buildTimeColumns({
  baseDate,
  disabledDate,
  formatLabel,
  max,
  min,
  minuteStep,
  precision,
  secondStep,
}: BuildTimeColumnsOptions): PickerColumn[] {
  return getTimeColumnTypes(precision).map(type =>
    buildColumn(type, {
      baseDate,
      disabledDate,
      formatLabel,
      max,
      min,
      precision,
      step: getStepForType(type, minuteStep, secondStep),
    }),
  );
}
