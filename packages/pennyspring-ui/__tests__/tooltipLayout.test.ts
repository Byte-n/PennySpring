import { resolveTooltipLayout } from '../src/Tooltip/tooltipLayout';

const TOKENS = {
  edgeInset: 12,
  lineHeight: 24,
  maxWidth: 240,
  minHeight: 32,
  offset: 8,
  paddingHorizontal: 8,
  paddingVertical: 4,
};

const VIEWPORT = { width: 400, height: 800 };

const BASE_PARAMS = {
  align: 'center' as const,
  placement: 'top' as const,
  tokens: TOKENS,
  viewport: VIEWPORT,
};

describe('resolveTooltipLayout', () => {
  it('centers the bubble above the anchor with padding included', () => {
    const layout = resolveTooltipLayout({
      ...BASE_PARAMS,
      anchor: { x: 200, y: 400, width: 24, height: 24 },
      content: { width: 160, height: 40 },
    });

    expect(layout).toEqual({
      hidden: false,
      placement: 'top',
      left: 124,
      top: 344,
      width: 176,
      height: 48,
      scrollable: false,
      scrollMaxHeight: 0,
    });
  });

  it('flips to the bottom when the top side is cramped but the bottom is roomier', () => {
    const layout = resolveTooltipLayout({
      ...BASE_PARAMS,
      anchor: { x: 200, y: 60, width: 24, height: 24 },
      content: { width: 160, height: 400 },
    });

    expect(layout.placement).toBe('bottom');
    expect(layout.top).toBe(92);
    expect(layout.height).toBe(408);
    expect(layout.scrollable).toBe(false);
  });

  it('caps the height to whole lines and scrolls when content is taller than the side', () => {
    const layout = resolveTooltipLayout({
      ...BASE_PARAMS,
      anchor: { x: 200, y: 400, width: 24, height: 24 },
      content: { width: 160, height: 700 },
    });

    expect(layout.placement).toBe('top');
    expect(layout.height).toBe(368);
    expect(layout.scrollMaxHeight).toBe(360);
    expect(layout.scrollable).toBe(true);
    expect(layout.top).toBe(24);
  });

  it('scrolls a horizontally placed bubble against the full container height', () => {
    const layout = resolveTooltipLayout({
      ...BASE_PARAMS,
      placement: 'left',
      anchor: { x: 300, y: 400, width: 24, height: 24 },
      content: { width: 160, height: 700 },
    });

    expect(layout.placement).toBe('left');
    expect(layout.height).toBe(272);
    expect(layout.scrollMaxHeight).toBe(264);
    expect(layout.left).toBe(116);
    expect(layout.top).toBe(276);
  });

  it('hides the bubble when the roomier side cannot fit a single line', () => {
    const layout = resolveTooltipLayout({
      ...BASE_PARAMS,
      viewport: { width: 400, height: 60 },
      anchor: { x: 200, y: 26, width: 24, height: 24 },
      content: { width: 160, height: 400 },
    });

    expect(layout.hidden).toBe(true);
  });

  it('caps the width at the max width and clamps inside the viewport', () => {
    const layout = resolveTooltipLayout({
      ...BASE_PARAMS,
      anchor: { x: 200, y: 400, width: 24, height: 24 },
      content: { width: 400, height: 40 },
    });

    expect(layout.width).toBe(240);
    expect(layout.left).toBe(92);
  });
});
