import {
  resolveActionLayout,
  resolveClampCenterY,
  resolveDockX,
  resolveFloatX,
  resolveGridColumns,
  resolveHitSlop,
  resolveIconShift,
  resolveMenuOriginX,
  resolveMetrics,
  resolveSide,
} from '../src/FloatingActionGroup/layout';

const containerWidth = 375;
const safeTop = 52;
const safeBottom = 770;

describe('FloatingActionGroup layout', () => {
  it('derives bookmark geometry and touch compensation from size', () => {
    // Arrange
    const normal = resolveMetrics('normal');
    const small = resolveMetrics('small');
    const large = resolveMetrics('large');

    // Act / Assert
    expect(normal.anchorSize).toBe(48);
    expect(normal.visibleWidth).toBe(32);
    expect(normal.hitSlop).toBe(12);
    expect(normal.visibleWidth + normal.hitSlop).toBe(44);

    expect(small.visibleWidth).toBe(28);
    expect(small.hitSlop).toBe(16);
    expect(small.visibleWidth + small.hitSlop).toBe(44);

    expect(large.visibleWidth).toBe(36);
    expect(large.hitSlop).toBe(8);
    expect(large.visibleWidth + large.hitSlop).toBe(44);
  });

  it('tucks the anchor outside the container when snapped and floats it inside otherwise', () => {
    // Arrange
    const metrics = resolveMetrics('normal');

    // Act / Assert
    expect(resolveDockX('right', containerWidth, metrics)).toBe(343);
    expect(resolveDockX('left', containerWidth, metrics)).toBe(-16);
    expect(resolveFloatX('right', containerWidth, 16, metrics)).toBe(311);
    expect(resolveFloatX('left', containerWidth, 16, metrics)).toBe(16);
  });

  it('moves hit slop and icon shift toward the screen interior when docked', () => {
    // Arrange
    const metrics = resolveMetrics('normal');

    // Act / Assert
    expect(resolveHitSlop(metrics, 'right', true)).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 12,
    });
    expect(resolveHitSlop(metrics, 'left', true)).toEqual({
      top: 0,
      right: 12,
      bottom: 0,
      left: 0,
    });
    expect(resolveHitSlop(metrics, 'right', false)).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
    expect(resolveIconShift(metrics, 'right', true)).toBe(-8);
    expect(resolveIconShift(metrics, 'left', true)).toBe(8);
    expect(resolveIconShift(metrics, 'right', false)).toBe(0);
  });

  it('maps placements to the nearest horizontal side', () => {
    expect(resolveSide('bottomRight')).toBe('right');
    expect(resolveSide('topLeft')).toBe('left');
    expect(resolveSide('centerLeft')).toBe('left');
    expect(resolveSide('centerRight')).toBe('right');
  });

  it('selects grid columns by action count', () => {
    expect(resolveGridColumns(2)).toBe(2);
    expect(resolveGridColumns(3)).toBe(3);
    expect(resolveGridColumns(4)).toBe(2);
    expect(resolveGridColumns(5)).toBe(3);
    expect(resolveGridColumns(9)).toBe(3);
    expect(resolveGridColumns(10)).toBe(4);
    expect(resolveGridColumns(12)).toBe(4);
  });

  it('lays out grid actions above a docked anchor from the nearest cell outward', () => {
    // Arrange
    const metrics = resolveMetrics('normal');

    // Act
    const layout = resolveActionLayout({
      count: 6,
      layout: 'grid',
      side: 'right',
      metrics,
      hasLabel: true,
      growUp: true,
    });

    // Assert
    expect(layout.type).toBe('grid');
    expect(layout.cols).toBe(3);
    expect(layout.rows).toBe(2);
    expect(layout.offsets).toHaveLength(6);
    expect(layout.offsets[0]).toMatchObject({ dx: 0, dy: -84 });
    expect(layout.offsets[1]).toMatchObject({ dx: -60, dy: -84 });
    expect(layout.offsets[2]).toMatchObject({ dx: -120, dy: -84 });
    expect(layout.offsets[3]).toMatchObject({ dx: 0, dy: -164 });
    expect(layout.up).toBe(188);
    expect(layout.down).toBe(24);
    expect(layout.offsets[0].labelDy).toBe(38);
  });

  it('mirrors grid columns for a left dock and grows downward in the top half', () => {
    // Arrange
    const metrics = resolveMetrics('normal');

    // Act
    const layout = resolveActionLayout({
      count: 4,
      layout: 'grid',
      side: 'left',
      metrics,
      hasLabel: true,
      growUp: false,
    });

    // Assert
    expect(layout.cols).toBe(2);
    expect(layout.rows).toBe(2);
    expect(layout.offsets[0]).toMatchObject({ dx: 0, dy: 60 });
    expect(layout.offsets[1]).toMatchObject({ dx: 60, dy: 60 });
    expect(layout.offsets[2]).toMatchObject({ dx: 0, dy: 140 });
    expect(layout.down).toBe(188);
  });

  it('lays out a fan around the inward normal and falls back to grid above eight actions', () => {
    // Arrange
    const metrics = resolveMetrics('normal');

    // Act
    const fan = resolveActionLayout({
      count: 5,
      layout: 'fan',
      side: 'right',
      metrics,
      hasLabel: true,
      growUp: true,
    });
    const fallback = resolveActionLayout({
      count: 9,
      layout: 'fan',
      side: 'right',
      metrics,
      hasLabel: true,
      growUp: true,
    });

    // Assert
    expect(fan.type).toBe('fan');
    expect(fan.spread).toBe(120);
    expect(fan.radius).toBe(112);
    expect(fan.offsets).toHaveLength(5);
    expect(fan.offsets[0].dx).toBeCloseTo(-56, 1);
    expect(fan.offsets[0].dy).toBeCloseTo(-97, 1);
    expect(fan.offsets[2].dx).toBeCloseTo(-112, 1);
    expect(fan.offsets[2].dy).toBeCloseTo(0, 1);
    expect(fan.offsets[4].dx).toBeCloseTo(-56, 1);
    expect(fan.offsets[4].dy).toBeCloseTo(97, 1);
    expect(fan.up).toBeCloseTo(162, 0);
    expect(fan.down).toBeCloseTo(162, 0);

    expect(fallback.type).toBe('grid');
    expect(fallback.cols).toBe(3);
    expect(fallback.rows).toBe(3);
  });

  it('keeps a docked menu origin at the safe inset and clamps a free origin inside the container', () => {
    // Arrange
    const metrics = resolveMetrics('normal');
    const layout = resolveActionLayout({
      count: 6,
      layout: 'grid',
      side: 'right',
      metrics,
      hasLabel: true,
      growUp: true,
    });

    // Act / Assert
    expect(
      resolveMenuOriginX({
        side: 'right',
        containerWidth,
        anchorX: 311,
        snapToEdge: true,
        metrics,
        layout,
      }),
    ).toBe(343);
    expect(
      resolveMenuOriginX({
        side: 'left',
        containerWidth,
        anchorX: 16,
        snapToEdge: true,
        metrics,
        layout,
      }),
    ).toBe(32);
    expect(
      resolveMenuOriginX({
        side: 'right',
        containerWidth,
        anchorX: 206,
        snapToEdge: false,
        metrics,
        layout,
      }),
    ).toBe(230);
    expect(
      resolveMenuOriginX({
        side: 'left',
        containerWidth,
        anchorX: 206,
        snapToEdge: false,
        metrics,
        layout,
      }),
    ).toBe(219);
  });

  it('clamps the anchor center so the menu stays inside the safe area', () => {
    // Arrange
    const metrics = resolveMetrics('normal');
    const layout = resolveActionLayout({
      count: 6,
      layout: 'grid',
      side: 'right',
      metrics,
      hasLabel: true,
      growUp: true,
    });

    // Act / Assert
    expect(resolveClampCenterY(100, layout, safeTop, safeBottom)).toBe(240);
    expect(resolveClampCenterY(500, layout, safeTop, safeBottom)).toBe(500);
    expect(resolveClampCenterY(900, layout, safeTop, safeBottom)).toBe(746);
  });
});
