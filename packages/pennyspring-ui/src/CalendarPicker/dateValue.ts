import type {
  CalendarPickerPrecision,
  CalendarPickerValueParams,
  CalendarPickerViewMode,
  CalendarPickerViewValue,
} from './types';

const MONTH_COUNT = 12;

function padDateValue(value: number): string {
  return String(value).padStart(2, '0');
}

function clampMonth(month: number): number {
  return Math.max(1, Math.min(MONTH_COUNT, month));
}

/** 将 Date 按精度格式化为面板使用的字符串值。 */
export function formatDateValue(
  date: Date,
  precision: CalendarPickerPrecision,
): CalendarPickerViewValue {
  const year = String(date.getFullYear());

  if (precision === 'year') {
    return year;
  }

  const month = padDateValue(date.getMonth() + 1);

  if (precision === 'month') {
    return `${year}-${month}`;
  }

  return `${year}-${month}-${padDateValue(date.getDate())}`;
}

/** 解析面板字符串值；缺失部分回退到 fallback 的对应字段。 */
export function parseDateValue(
  value: CalendarPickerViewValue,
  fallback: Date,
): Date {
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText) || fallback.getFullYear();
  const month = clampMonth(Number(monthText) || fallback.getMonth() + 1);
  const maxDay = new Date(year, month, 0).getDate();
  const day = Math.min(Number(dayText) || fallback.getDate(), maxDay);

  return new Date(
    year,
    month - 1,
    day,
    fallback.getHours(),
    fallback.getMinutes(),
    fallback.getSeconds(),
    0,
  );
}

/** 精度到面板模式的映射。 */
export function getCalendarViewMode(
  precision: CalendarPickerPrecision,
): CalendarPickerViewMode {
  if (precision === 'year') {
    return 'year';
  }

  if (precision === 'month') {
    return 'month';
  }

  return 'date';
}

/** 将时间部分归零，保留本地日期字段；仅日期的选择器统一使用这一口径。 */
export function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

/** 将日期拆成回传参数。 */
export function toCalendarPickerParams(date: Date): CalendarPickerValueParams {
  return {
    date,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

/** 将 Date 转换为面板字符串值。 */
export function toCalendarViewValue(
  date: Date,
  precision: CalendarPickerPrecision,
): CalendarPickerViewValue {
  return formatDateValue(date, precision);
}
