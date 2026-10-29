import type { PopoverAlign, PopoverPlacement } from './types';

export interface PopoverAnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PopoverPanelSize {
  width: number;
  height: number;
}

export interface PopoverViewport {
  width: number;
  height: number;
}

export interface PopoverLayoutParams {
  anchor: PopoverAnchorRect;
  panel: PopoverPanelSize;
  viewport: PopoverViewport;
  placement: PopoverPlacement;
  align: PopoverAlign;
  offset: number;
  edgeInset: number;
  /** 面板内容可收缩（如可滚动）时，对侧更宽裕即可翻面。 */
  allowShrink?: boolean;
}

export interface PopoverLayout {
  left: number;
  top: number;
  placement: PopoverPlacement;
}

function isHorizontalPlacement(placement: PopoverPlacement): boolean {
  return placement === 'left' || placement === 'right';
}

function getOppositePlacement(placement: PopoverPlacement): PopoverPlacement {
  if (placement === 'top') {
    return 'bottom';
  }

  if (placement === 'bottom') {
    return 'top';
  }

  if (placement === 'left') {
    return 'right';
  }

  return 'left';
}

function getAvailableSpace(
  placement: PopoverPlacement,
  anchor: PopoverAnchorRect,
  viewport: PopoverViewport,
  edgeInset: number,
): number {
  if (placement === 'top') {
    return anchor.y - edgeInset;
  }

  if (placement === 'bottom') {
    return viewport.height - edgeInset - (anchor.y + anchor.height);
  }

  if (placement === 'left') {
    return anchor.x - edgeInset;
  }

  return viewport.width - edgeInset - (anchor.x + anchor.width);
}

function getRequiredSpace(
  placement: PopoverPlacement,
  panel: PopoverPanelSize,
  offset: number,
): number {
  const panelExtent = isHorizontalPlacement(placement)
    ? panel.width
    : panel.height;

  return panelExtent + offset;
}

export function getPopoverAvailableExtent(
  placement: PopoverPlacement,
  anchor: PopoverAnchorRect,
  viewport: PopoverViewport,
  edgeInset: number,
  offset: number,
): number {
  return getAvailableSpace(placement, anchor, viewport, edgeInset) - offset;
}

function alignCrossAxis(
  anchorStart: number,
  anchorExtent: number,
  panelExtent: number,
  align: PopoverAlign,
): number {
  if (align === 'start') {
    return anchorStart;
  }

  if (align === 'end') {
    return anchorStart + anchorExtent - panelExtent;
  }

  return anchorStart + (anchorExtent - panelExtent) / 2;
}

function clamp(value: number, min: number, max: number): number {
  const resolvedMax = Math.max(min, max);

  if (value < min) {
    return min;
  }

  if (value > resolvedMax) {
    return resolvedMax;
  }

  return value;
}

export function resolvePopoverLayout({
  anchor,
  align,
  allowShrink = false,
  edgeInset,
  offset,
  panel,
  placement,
  viewport,
}: PopoverLayoutParams): PopoverLayout {
  let resolvedPlacement = placement;
  const requiredSpace = getRequiredSpace(placement, panel, offset);
  const availableSpace = getAvailableSpace(
    placement,
    anchor,
    viewport,
    edgeInset,
  );

  if (availableSpace < requiredSpace) {
    const oppositePlacement = getOppositePlacement(placement);
    const oppositeSpace = getAvailableSpace(
      oppositePlacement,
      anchor,
      viewport,
      edgeInset,
    );
    const shouldFlip = allowShrink
      ? oppositeSpace > availableSpace
      : oppositeSpace >= getRequiredSpace(oppositePlacement, panel, offset);

    if (shouldFlip) {
      resolvedPlacement = oppositePlacement;
    }
  }

  let left: number;
  let top: number;

  if (resolvedPlacement === 'top') {
    left = alignCrossAxis(anchor.x, anchor.width, panel.width, align);
    top = anchor.y - panel.height - offset;
  } else if (resolvedPlacement === 'left') {
    left = anchor.x - panel.width - offset;
    top = alignCrossAxis(anchor.y, anchor.height, panel.height, align);
  } else if (resolvedPlacement === 'right') {
    left = anchor.x + anchor.width + offset;
    top = alignCrossAxis(anchor.y, anchor.height, panel.height, align);
  } else {
    left = alignCrossAxis(anchor.x, anchor.width, panel.width, align);
    top = anchor.y + anchor.height + offset;
  }

  return {
    left: clamp(left, edgeInset, viewport.width - panel.width - edgeInset),
    top: clamp(top, edgeInset, viewport.height - panel.height - edgeInset),
    placement: resolvedPlacement,
  };
}
