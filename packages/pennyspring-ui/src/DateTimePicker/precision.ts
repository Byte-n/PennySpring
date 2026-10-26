import type { CalendarPickerViewMode } from '../CalendarPicker/types';
import type {
  DateTimePickerColumnType,
  DateTimePickerDatePrecision,
  DateTimePickerParts,
  DateTimePickerPrecision,
  DateTimePickerTimePrecision,
} from './types';

export type { DateTimePickerParts } from './types';

export const DATE_PRECISIONS = ['year', 'month', 'day'] as const;
export const TIME_PRECISIONS = ['hour', 'minute', 'second'] as const;

const DATE_COLUMN_TYPES: DateTimePickerColumnType[] = ['year', 'month', 'day'];
const TIME_COLUMN_TYPES: DateTimePickerColumnType[] = [
  'hour',
  'minute',
  'second',
];
const DEFAULT_PARTS_PRECISION: Record<DateTimePickerParts, DateTimePickerPrecision> = {
  datetime: 'minute',
  date: 'day',
  time: 'minute',
};

function indexOfPrecision(
  precisions: readonly string[],
  precision: string,
): number {
  return precisions.indexOf(precision);
}

/** 日期列链 = 年/月/日；时间列链 = 时/分/秒；日期时间按精度拼接。 */
export function getColumnTypes(
  parts: DateTimePickerParts,
  precision?: DateTimePickerPrecision,
): DateTimePickerColumnType[] {
  const resolved = normalizePrecision(parts, precision);

  if (parts === 'date') {
    const dateIndex = indexOfPrecision(DATE_PRECISIONS, resolved);

    return DATE_COLUMN_TYPES.slice(0, dateIndex + 1);
  }

  if (parts === 'time') {
    const timeIndex = indexOfPrecision(TIME_PRECISIONS, resolved);

    return TIME_COLUMN_TYPES.slice(0, timeIndex + 1);
  }

  const dateIndex = indexOfPrecision(DATE_PRECISIONS, resolved);

  if (dateIndex >= 0) {
    return DATE_COLUMN_TYPES.slice(0, dateIndex + 1);
  }

  const timeIndex = indexOfPrecision(TIME_PRECISIONS, resolved);

  return [...DATE_COLUMN_TYPES, ...TIME_COLUMN_TYPES.slice(0, timeIndex + 1)];
}

export function getDefaultPrecision(
  parts: DateTimePickerParts,
): DateTimePickerPrecision {
  return DEFAULT_PARTS_PRECISION[parts];
}

/** 越界精度回退到当前 parts 的默认精度。 */
export function normalizePrecision(
  parts: DateTimePickerParts,
  precision?: DateTimePickerPrecision,
): DateTimePickerPrecision {
  if (precision === undefined) {
    return getDefaultPrecision(parts);
  }

  if (parts === 'date' && indexOfPrecision(DATE_PRECISIONS, precision) < 0) {
    return getDefaultPrecision(parts);
  }

  if (parts === 'time' && indexOfPrecision(TIME_PRECISIONS, precision) < 0) {
    return getDefaultPrecision(parts);
  }

  return precision;
}

export function hasTimePart(
  parts: DateTimePickerParts,
  precision?: DateTimePickerPrecision,
): boolean {
  if (parts === 'time') {
    return true;
  }

  if (parts === 'date') {
    return false;
  }

  return indexOfPrecision(TIME_PRECISIONS, normalizePrecision(parts, precision)) >= 0;
}

export function hasDatePart(
  parts: DateTimePickerParts,
  precision?: DateTimePickerPrecision,
): boolean {
  return getColumnTypes(parts, precision).some(type =>
    indexOfPrecision(DATE_PRECISIONS, type) >= 0,
  );
}

/** 日历面板模式：年/月/日三档，带时间的精度统一使用日期网格。 */
export function getCalendarViewMode(
  precision: DateTimePickerPrecision,
): CalendarPickerViewMode {
  if (precision === 'year') {
    return 'year';
  }

  if (precision === 'month') {
    return 'month';
  }

  return 'date';
}

/** 面板只接受年/月/日精度，带时间的精度统一按日展示。 */
export function getDatePrecision(
  precision: DateTimePickerPrecision,
): DateTimePickerDatePrecision {
  if (precision === 'year') {
    return 'year';
  }

  if (precision === 'month') {
    return 'month';
  }

  return 'day';
}

/** 时间列精度：带秒保留秒，其余按分钟展示。 */
export function getTimePrecision(
  precision: DateTimePickerPrecision,
): DateTimePickerTimePrecision {
  if (precision === 'hour' || precision === 'second') {
    return precision;
  }

  return 'minute';
}
