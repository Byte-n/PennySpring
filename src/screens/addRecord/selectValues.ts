import type { SelectionListValue } from '@pennyspring/ui';

export function toNumberValue(
  value: SelectionListValue | SelectionListValue[],
): number | undefined {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numberValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export function toNumberValues(
  value: SelectionListValue | SelectionListValue[],
): number[] {
  const values = Array.isArray(value) ? value : [value];

  return values
    .map(item => (typeof item === 'number' ? item : Number(item)))
    .filter(item => Number.isFinite(item));
}
