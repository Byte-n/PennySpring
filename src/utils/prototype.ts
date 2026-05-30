/* eslint-disable no-extend-native */
import dayjs from 'dayjs';

const RELATIVE_LABELS: Record<number, string> = { '-1': '（明天）', 0: '（今天）', 1: '（昨天）', 2: '（前天）' };

function withRelativeSuffix(ts: number, base: string): string {
  const todayStart = dayjs().startOf('day');
  const diffDays = todayStart.diff(dayjs(ts).startOf('day'), 'day');
  const suffix = RELATIVE_LABELS[diffDays] ?? '';
  return suffix ? `${base}${suffix}` : base;
}

Number.prototype.formatDate = function (relative = true) {
  const base = dayjs(Number(this)).format('MM-DD');
  return relative ? withRelativeSuffix(Number(this), base) : base;
};

Number.prototype.formatDateTime = function () {
  return dayjs(Number(this)).format('YYYY-MM-DD HH:mm');
};

Number.prototype.formatDateBy = function (format: string) {
  return dayjs(Number(this)).format(format);
};

String.prototype.formatDate = function (relative = true) {
  const ts = dayjs(String(this)).valueOf();
  const base = dayjs(ts).format('MM-DD');
  return relative ? withRelativeSuffix(ts, base) : base;
};

String.prototype.formatDateTime = function () {
  return dayjs(String(this)).format('YYYY-MM-DD HH:mm');
};

String.prototype.formatDateBy = function (format: string) {
  return dayjs(String(this)).format(format);
};

Date.prototype.formatDate = function (relative = true) {
  const ts = this.getTime();
  const base = dayjs(ts).format('MM-DD');
  return relative ? withRelativeSuffix(ts, base) : base;
};

Date.prototype.formatDateTime = function () {
  return dayjs(this).format('YYYY-MM-DD HH:mm');
};

Date.prototype.formatDateBy = function (format: string) {
  return dayjs(this).format(format);
};

(dayjs as any).fn.formatDate = function (this: ReturnType<typeof dayjs>, relative = true) {
  const ts = this.valueOf();
  const base = this.format('MM-DD');
  return relative ? withRelativeSuffix(ts, base) : base;
};
(dayjs as any).fn.formatDateTime = function (this: ReturnType<typeof dayjs>) {
  return this.format('YYYY-MM-DD HH:mm');
};
(dayjs as any).fn.formatDateBy = function (this: ReturnType<typeof dayjs>, format: string) {
  return this.format(format);
};
