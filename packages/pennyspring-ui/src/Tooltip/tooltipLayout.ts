import {
  getPopoverAvailableExtent,
  resolvePopoverLayout,
} from '../Popover/popoverLayout';
import type {
  PopoverAnchorRect,
  PopoverViewport,
} from '../Popover/popoverLayout';
import type { PopoverAlign, PopoverPlacement } from '../Popover/types';

export interface TooltipContentSize {
  width: number;
  height: number;
}

export interface TooltipLayoutTokens {
  edgeInset: number;
  lineHeight: number;
  maxWidth: number;
  minHeight: number;
  offset: number;
  paddingHorizontal: number;
  paddingVertical: number;
}

export interface TooltipLayoutParams {
  anchor: PopoverAnchorRect;
  align: PopoverAlign;
  content: TooltipContentSize;
  placement: PopoverPlacement;
  tokens: TooltipLayoutTokens;
  viewport: PopoverViewport;
}

export interface TooltipLayout {
  hidden: boolean;
  placement: PopoverPlacement;
  left: number;
  top: number;
  width: number;
  height: number;
  scrollable: boolean;
  scrollMaxHeight: number;
}

/** 内容超出可用高度时按整行收缩，避免露出半行文字。 */
export function resolveTooltipLayout({
  align,
  anchor,
  content,
  placement,
  tokens,
  viewport,
}: TooltipLayoutParams): TooltipLayout {
  const width = Math.min(
    content.width + tokens.paddingHorizontal * 2,
    tokens.maxWidth,
  );
  const naturalHeight = content.height + tokens.paddingVertical * 2;

  const preferred = resolvePopoverLayout({
    align,
    allowShrink: true,
    anchor,
    edgeInset: tokens.edgeInset,
    offset: tokens.offset,
    panel: { width, height: naturalHeight },
    placement,
    viewport,
  });

  const available = getPopoverAvailableExtent(
    preferred.placement,
    anchor,
    viewport,
    tokens.edgeInset,
    tokens.offset,
  );
  const scrollable = naturalHeight > available;
  const height = scrollable
    ? Math.floor((available - tokens.paddingVertical * 2) / tokens.lineHeight) *
        tokens.lineHeight +
      tokens.paddingVertical * 2
    : naturalHeight;

  if (height < tokens.minHeight) {
    return {
      hidden: true,
      placement: preferred.placement,
      left: 0,
      top: 0,
      width,
      height,
      scrollable,
      scrollMaxHeight: 0,
    };
  }

  const resolved = resolvePopoverLayout({
    align,
    anchor,
    edgeInset: tokens.edgeInset,
    offset: tokens.offset,
    panel: { width, height },
    placement: preferred.placement,
    viewport,
  });

  return {
    hidden: false,
    placement: resolved.placement,
    left: resolved.left,
    top: resolved.top,
    width,
    height,
    scrollable,
    scrollMaxHeight: scrollable ? height - tokens.paddingVertical * 2 : 0,
  };
}
