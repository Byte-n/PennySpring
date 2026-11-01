export function clampValue(
  value: number,
  lower: number,
  upper: number,
): number {
  return Math.min(Math.max(value, lower), upper);
}
