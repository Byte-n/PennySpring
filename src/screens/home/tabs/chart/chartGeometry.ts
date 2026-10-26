export interface ChartPoint {
  x: number;
  y: number;
}

export interface AxisModel {
  max: number;
  step: number;
  ticks: number[];
}

const AXIS_MAGNITUDE_BASE = 10;
const AXIS_NICE_STEPS = [1, 2, 2.5, 5, 10];
const MIN_AXIS_VALUE = 1;

export function buildAxis(maxValue: number, divisions = 4): AxisModel {
  const safeMax = Math.max(maxValue, MIN_AXIS_VALUE);
  const rawStep = safeMax / divisions;
  const magnitude = AXIS_MAGNITUDE_BASE ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceStep =
    AXIS_NICE_STEPS.find(step => normalized <= step) ??
    AXIS_NICE_STEPS[AXIS_NICE_STEPS.length - 1];
  const step = niceStep * magnitude;
  return {
    max: step * divisions,
    step,
    ticks: Array.from({ length: divisions + 1 }, (_, index) => index * step),
  };
}

export function buildLinePath(points: readonly ChartPoint[]): string {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .join(' ');
}

export function buildAreaPath(
  points: readonly ChartPoint[],
  baselineY: number,
): string {
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${buildLinePath(points)} L${last.x.toFixed(1)} ${baselineY.toFixed(
    1,
  )} L${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}
