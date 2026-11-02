export function clampValue(
  value: number,
  lower: number,
  upper: number,
): number {
  'worklet';
  return Math.min(Math.max(value, lower), upper);
}
