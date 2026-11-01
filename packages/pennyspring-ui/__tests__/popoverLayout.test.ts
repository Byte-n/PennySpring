import {
  getPopoverAvailableExtent,
  resolvePopoverLayout,
} from '../src/Popover/popoverLayout';

const DEFAULT_PARAMS = {
  anchor: { x: 200, y: 100, width: 24, height: 24 },
  panel: { width: 160, height: 120 },
  viewport: { width: 400, height: 800 },
  placement: 'bottom' as const,
  align: 'center' as const,
  offset: 8,
  edgeInset: 12,
};

describe('resolvePopoverLayout', () => {
  it('places the panel below the anchor and centers it horizontally', () => {
    expect(resolvePopoverLayout(DEFAULT_PARAMS)).toEqual({
      left: 132,
      top: 132,
      placement: 'bottom',
    });
  });

  it('flips to the top when there is not enough space below', () => {
    const layout = resolvePopoverLayout({
      ...DEFAULT_PARAMS,
      anchor: { x: 200, y: 700, width: 24, height: 24 },
    });

    expect(layout).toEqual({
      left: 132,
      top: 572,
      placement: 'top',
    });
  });

  it('clamps an end-aligned panel inside the viewport', () => {
    const layout = resolvePopoverLayout({
      ...DEFAULT_PARAMS,
      anchor: { x: 380, y: 100, width: 20, height: 24 },
      align: 'end',
    });

    expect(layout.left).toBe(228);
  });

  it('places a right-side panel after the anchor and clamps it vertically', () => {
    const layout = resolvePopoverLayout({
      ...DEFAULT_PARAMS,
      anchor: { x: 100, y: 30, width: 24, height: 24 },
      placement: 'right',
    });

    expect(layout).toEqual({
      left: 132,
      top: 12,
      placement: 'right',
    });
  });

  it('flips horizontally when there is not enough space on the right', () => {
    const layout = resolvePopoverLayout({
      ...DEFAULT_PARAMS,
      anchor: { x: 330, y: 100, width: 24, height: 24 },
      placement: 'right',
    });

    expect(layout).toEqual({
      left: 162,
      top: 52,
      placement: 'left',
    });
  });

  it('keeps the preferred side when neither side fully fits', () => {
    const layout = resolvePopoverLayout({
      ...DEFAULT_PARAMS,
      panel: { width: 160, height: 700 },
      anchor: { x: 200, y: 60, width: 24, height: 24 },
      placement: 'top',
    });

    expect(layout.placement).toBe('top');
  });

  it('flips to the roomier side when allowShrink is enabled', () => {
    const layout = resolvePopoverLayout({
      ...DEFAULT_PARAMS,
      panel: { width: 160, height: 700 },
      anchor: { x: 200, y: 60, width: 24, height: 24 },
      placement: 'top',
      allowShrink: true,
    });

    expect(layout.placement).toBe('bottom');
    expect(layout.top).toBe(88);
  });

  it('keeps the preferred side when it is already the roomier one', () => {
    const layout = resolvePopoverLayout({
      ...DEFAULT_PARAMS,
      panel: { width: 160, height: 700 },
      anchor: { x: 200, y: 400, width: 24, height: 24 },
      placement: 'top',
      allowShrink: true,
    });

    expect(layout.placement).toBe('top');
  });
});

describe('getPopoverAvailableExtent', () => {
  const anchor = { x: 200, y: 300, width: 24, height: 24 };
  const viewport = { width: 400, height: 800 };

  it('measures the room above the anchor', () => {
    expect(getPopoverAvailableExtent('top', anchor, viewport, 12, 8)).toBe(280);
  });

  it('measures the room below the anchor', () => {
    expect(getPopoverAvailableExtent('bottom', anchor, viewport, 12, 8)).toBe(
      456,
    );
  });

  it('measures the room left of the anchor', () => {
    expect(getPopoverAvailableExtent('left', anchor, viewport, 12, 8)).toBe(
      180,
    );
  });

  it('measures the room right of the anchor', () => {
    expect(getPopoverAvailableExtent('right', anchor, viewport, 12, 8)).toBe(
      156,
    );
  });
});
