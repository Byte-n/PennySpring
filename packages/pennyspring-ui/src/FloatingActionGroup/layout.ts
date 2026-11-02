import type { ComponentSize } from '../shares/types';
import type { FloatingLayout, FloatingPlacement } from './types';

export type FloatingSide = 'left' | 'right';

export interface FloatingHitSlop {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface FloatingMetrics {
  anchorSize: number;
  tuck: number;
  visibleWidth: number;
  hitSlop: number;
  iconSize: number;
  iconShift: number;
  radius: number;
  spacing: number;
  rowGap: number;
  labelMaxWidth: number;
  labelHeight: number;
  labelGap: number;
  labelOffset: number;
}

export interface ActionOffset {
  dx: number;
  dy: number;
  labelDx: number;
  labelDy: number;
}

export interface ResolvedActionLayout {
  type: FloatingLayout;
  cols: number;
  rows: number;
  spread: number;
  radius: number;
  offsets: ActionOffset[];
  labelOffset: number;
  labelMaxWidth: number;
  up: number;
  down: number;
  inwardInset: number;
  wallInset: number;
}

interface SizeGeometry {
  anchorSize: number;
  tuck: number;
  iconSize: number;
  radius: number;
}

interface ActionLayoutParams {
  count: number;
  layout: FloatingLayout;
  side: FloatingSide;
  metrics: FloatingMetrics;
  hasLabel: boolean;
  growUp: boolean;
}

interface MenuOriginParams {
  side: FloatingSide;
  containerWidth: number;
  anchorX: number;
  snapToEdge: boolean;
  metrics: FloatingMetrics;
  layout: ResolvedActionLayout;
}

const MIN_TOUCH_SIZE = 44;
const DEFAULT_SPACING = 12;
const LABEL_HEIGHT = 20;
const LABEL_GAP = 4;
const ROW_GAP_OFFSET = 4;
const DOCK_INSET = 8;
const FAN_MAX_COUNT = 8;
const FAN_RADIUS_BY_COUNT = [96, 112, 140] as const;
const BASE_ANCHOR_SIZE = 48;

const SIZE_GEOMETRY: Record<ComponentSize, SizeGeometry> = {
  small: { anchorSize: 40, tuck: 12, iconSize: 18, radius: 12 },
  normal: { anchorSize: 48, tuck: 16, iconSize: 22, radius: 16 },
  large: { anchorSize: 56, tuck: 20, iconSize: 24, radius: 16 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampRange(value: number, min: number, max: number): number {
  if (max < min) {
    return (min + max) / 2;
  }

  return clamp(value, min, max);
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function resolveMetrics(
  size: ComponentSize,
  spacing = DEFAULT_SPACING,
): FloatingMetrics {
  const geometry = SIZE_GEOMETRY[size];
  const visibleWidth = geometry.anchorSize - geometry.tuck;

  return {
    anchorSize: geometry.anchorSize,
    tuck: geometry.tuck,
    visibleWidth,
    hitSlop: Math.max(0, MIN_TOUCH_SIZE - visibleWidth),
    iconSize: geometry.iconSize,
    iconShift: geometry.tuck / 2,
    radius: geometry.radius,
    spacing,
    rowGap: Math.max(4, spacing - ROW_GAP_OFFSET),
    labelMaxWidth: geometry.anchorSize + 8,
    labelHeight: LABEL_HEIGHT,
    labelGap: LABEL_GAP,
    labelOffset: geometry.anchorSize + 16,
  };
}

export function resolveSide(placement: FloatingPlacement): FloatingSide {
  return placement.endsWith('Left') ? 'left' : 'right';
}

export function resolveGrowUp(
  anchorCenterY: number,
  containerHeight: number,
): boolean {
  return anchorCenterY > containerHeight / 2;
}

export function resolveDockX(
  side: FloatingSide,
  containerWidth: number,
  metrics: FloatingMetrics,
): number {
  return side === 'right'
    ? containerWidth - metrics.anchorSize + metrics.tuck
    : -metrics.tuck;
}

export function resolveFloatX(
  side: FloatingSide,
  containerWidth: number,
  offsetX: number,
  metrics: FloatingMetrics,
): number {
  const x =
    side === 'right' ? containerWidth - offsetX - metrics.anchorSize : offsetX;

  return clamp(x, 0, Math.max(0, containerWidth - metrics.anchorSize));
}

export function resolveHitSlop(
  metrics: FloatingMetrics,
  side: FloatingSide,
  isDocked: boolean,
): FloatingHitSlop {
  if (!isDocked) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  return side === 'right'
    ? { top: 0, right: 0, bottom: 0, left: metrics.hitSlop }
    : { top: 0, right: metrics.hitSlop, bottom: 0, left: 0 };
}

export function resolveIconShift(
  metrics: FloatingMetrics,
  side: FloatingSide,
  isDocked: boolean,
): number {
  if (!isDocked) {
    return 0;
  }

  return side === 'right' ? -metrics.iconShift : metrics.iconShift;
}

export function resolveGridColumns(count: number): number {
  if (count <= 3) {
    return count;
  }

  if (count === 4) {
    return 2;
  }

  if (count <= 9) {
    return 3;
  }

  return 4;
}

export function resolveFanSpread(count: number): number {
  if (count <= 2) {
    return 90;
  }

  if (count === 3) {
    return 100;
  }

  if (count <= 5) {
    return 120;
  }

  return 150;
}

export function resolveFanRadius(
  count: number,
  metrics: FloatingMetrics,
): number {
  const index = count <= 3 ? 0 : count <= 6 ? 1 : 2;

  return FAN_RADIUS_BY_COUNT[index] + (metrics.anchorSize - BASE_ANCHOR_SIZE);
}

export function resolveActionLayout({
  count,
  layout,
  side,
  metrics,
  hasLabel,
  growUp,
}: ActionLayoutParams): ResolvedActionLayout {
  const type: FloatingLayout =
    layout === 'fan' && count <= FAN_MAX_COUNT ? 'fan' : 'grid';

  if (type === 'fan') {
    return resolveFanLayout({ count, side, metrics, hasLabel });
  }

  return resolveGridLayout({
    count,
    side,
    metrics,
    hasLabel,
    growUp,
  });
}

function resolveGridLayout({
  count,
  side,
  metrics,
  hasLabel,
  growUp,
}: Omit<ActionLayoutParams, 'layout'>): ResolvedActionLayout {
  const cols = resolveGridColumns(count);
  const rows = count > 0 ? Math.ceil(count / cols) : 0;
  const labelExtra = hasLabel ? metrics.labelGap + metrics.labelHeight : 0;
  const step = metrics.anchorSize + metrics.spacing;
  const firstUp = metrics.anchorSize + metrics.spacing + labelExtra;
  const firstDown = metrics.anchorSize + metrics.spacing;
  const rowStep = metrics.anchorSize + labelExtra + metrics.rowGap;
  const offsets: ActionOffset[] = [];

  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const dx = col === 0 ? 0 : (side === 'right' ? -1 : 1) * col * step;
    const dy = growUp ? -(firstUp + row * rowStep) : firstDown + row * rowStep;

    offsets.push({
      dx,
      dy,
      labelDx: 0,
      labelDy: hasLabel
        ? metrics.anchorSize / 2 + metrics.labelGap + metrics.labelHeight / 2
        : 0,
    });
  }

  const lastRowDistance = rows > 0 ? (rows - 1) * rowStep : 0;
  const up = growUp
    ? firstUp + lastRowDistance + metrics.anchorSize / 2
    : metrics.anchorSize / 2;
  const down = growUp
    ? metrics.anchorSize / 2
    : firstDown + lastRowDistance + metrics.anchorSize / 2 + labelExtra;
  const wallInset = hasLabel
    ? metrics.labelMaxWidth / 2
    : metrics.anchorSize / 2;
  const inwardInset = Math.max(0, cols - 1) * step + wallInset;

  return {
    type: 'grid',
    cols,
    rows,
    spread: 0,
    radius: 0,
    offsets,
    labelOffset: 0,
    labelMaxWidth: metrics.labelMaxWidth,
    up,
    down,
    inwardInset,
    wallInset,
  };
}

function resolveFanLayout({
  count,
  side,
  metrics,
  hasLabel,
}: Omit<ActionLayoutParams, 'layout' | 'growUp'>): ResolvedActionLayout {
  const spread = resolveFanSpread(count);
  const radius = resolveFanRadius(count, metrics);
  const halfSpread = toRadians(spread) / 2;
  const step = count > 1 ? toRadians(spread) / (count - 1) : 0;
  const inward = side === 'right' ? Math.PI : 0;
  const topAngle = side === 'right' ? inward + halfSpread : inward - halfSpread;
  const direction = side === 'right' ? -1 : 1;
  const labelOffset = hasLabel ? metrics.labelOffset : 0;
  const offsets: ActionOffset[] = [];

  for (let index = 0; index < count; index += 1) {
    const angle = topAngle + direction * index * step;

    offsets.push({
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius,
      labelDx: Math.cos(angle) * labelOffset,
      labelDy: Math.sin(angle) * labelOffset,
    });
  }

  const buttonExtent = radius * Math.sin(halfSpread) + metrics.anchorSize / 2;
  const labelExtent = hasLabel
    ? (radius + metrics.labelOffset) * Math.sin(halfSpread) +
      metrics.labelHeight / 2
    : 0;
  const extent = Math.max(metrics.anchorSize / 2, buttonExtent, labelExtent);
  const wallInset = hasLabel
    ? metrics.labelMaxWidth / 2
    : metrics.anchorSize / 2;
  const inwardInset = radius + (hasLabel ? metrics.labelOffset : 0) + wallInset;

  return {
    type: 'fan',
    cols: 0,
    rows: 0,
    spread,
    radius,
    offsets,
    labelOffset,
    labelMaxWidth: metrics.labelMaxWidth,
    up: extent,
    down: extent,
    inwardInset,
    wallInset,
  };
}

export function resolveMenuOriginX({
  side,
  containerWidth,
  anchorX,
  snapToEdge,
  metrics,
  layout,
}: MenuOriginParams): number {
  if (snapToEdge) {
    return side === 'right'
      ? containerWidth - DOCK_INSET - metrics.anchorSize / 2
      : DOCK_INSET + metrics.anchorSize / 2;
  }

  const origin = anchorX + metrics.anchorSize / 2;

  return side === 'right'
    ? clampRange(
        origin,
        DOCK_INSET + layout.inwardInset,
        containerWidth - DOCK_INSET - layout.wallInset,
      )
    : clampRange(
        origin,
        DOCK_INSET + layout.wallInset,
        containerWidth - DOCK_INSET - layout.inwardInset,
      );
}

export function resolveClampCenterY(
  centerY: number,
  layout: ResolvedActionLayout,
  safeTop: number,
  safeBottom: number,
): number {
  return clampRange(centerY, safeTop + layout.up, safeBottom - layout.down);
}

export function resolveInitialTop(
  placement: FloatingPlacement,
  containerHeight: number,
  offsetY: number,
  safeTop: number,
  safeBottom: number,
  metrics: FloatingMetrics,
): number {
  let top: number;

  if (placement.startsWith('top')) {
    top = safeTop + offsetY;
  } else if (placement.startsWith('bottom')) {
    top = safeBottom - offsetY - metrics.anchorSize;
  } else {
    top = (containerHeight - metrics.anchorSize) / 2;
  }

  return clamp(top, safeTop, safeBottom - metrics.anchorSize);
}
