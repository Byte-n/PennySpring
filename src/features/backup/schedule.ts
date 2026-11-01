import type { AutoBackupFrequency } from './autoBackupStore';

export interface AutoBackupSchedule {
  frequency: AutoBackupFrequency;
  customDays: number;
  lastRunAt: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function localDayValue(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function weekKey(date: Date): string {
  const day = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((day.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7,
  );
  return `${day.getUTCFullYear()}-${week}`;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

export function isAutoBackupDue(
  schedule: AutoBackupSchedule,
  now: Date,
  didRunThisSession: boolean,
): boolean {
  if (schedule.frequency === 'off') return false;
  if (schedule.frequency === 'everyLaunch') return !didRunThisSession;
  if (schedule.lastRunAt <= 0) return true;

  const last = new Date(schedule.lastRunAt);
  if (Number.isNaN(last.getTime())) return true;

  switch (schedule.frequency) {
    case 'daily':
      return dayKey(last) !== dayKey(now);
    case 'weekly':
      return weekKey(last) !== weekKey(now);
    case 'monthly':
      return monthKey(last) !== monthKey(now);
    case 'customDays': {
      const elapsedDays = (localDayValue(now) - localDayValue(last)) / DAY_MS;
      return elapsedDays >= Math.max(1, schedule.customDays);
    }
    default:
      return false;
  }
}
