import {
  clampIndex,
  getDisplayedImageSize,
  getDoubleTapTransform,
  getMaxTranslation,
  getPinchTransform,
  isSameImageSource,
  normalizePreviewItems,
} from '../src/Image/utils';

describe('Image utils', () => {
  it('compares image sources by uri or asset id', () => {
    expect(isSameImageSource({ uri: 'a.jpg' }, { uri: 'a.jpg' })).toBe(true);
    expect(isSameImageSource({ uri: 'a.jpg' }, { uri: 'b.jpg' })).toBe(false);
    expect(isSameImageSource(1, 1)).toBe(true);
    expect(isSameImageSource(1, 2)).toBe(false);
    expect(isSameImageSource([{ uri: 'a.jpg' }], [{ uri: 'a.jpg' }])).toBe(false);
  });

  it('normalizes raw sources and wrapped items', () => {
    const raw = { uri: 'a.jpg' };
    const wrapped = { src: { uri: 'b.jpg' } };

    expect(normalizePreviewItems([raw, wrapped])).toEqual([
      raw,
      wrapped.src,
    ]);
  });

  it('clamps an index into the available image range', () => {
    expect(clampIndex(2, 3)).toBe(2);
    expect(clampIndex(5, 3)).toBe(2);
    expect(clampIndex(-1, 3)).toBe(0);
    expect(clampIndex(0, 0)).toBe(0);
  });

  it('fits an image into the container with contain semantics', () => {
    expect(
      getDisplayedImageSize({
        containerHeight: 400,
        containerWidth: 300,
        imageHeight: 500,
        imageWidth: 1_000,
      }),
    ).toEqual({ height: 150, width: 300 });
  });

  it('limits translation to the scaled image overflow', () => {
    expect(
      getMaxTranslation({
        containerHeight: 400,
        containerWidth: 300,
        imageHeight: 500,
        imageWidth: 1_000,
        scale: 2,
      }),
    ).toEqual({ x: 150, y: 0 });
  });

  it('keeps the pinch focal point fixed', () => {
    expect(
      getPinchTransform({
        focalX: 50,
        focalY: 20,
        nextScale: 2,
        savedScale: 1,
        savedX: 0,
        savedY: 0,
      }),
    ).toEqual({ scale: 2, x: -50, y: -20 });

    expect(
      getPinchTransform({
        focalX: 50,
        focalY: 20,
        nextScale: 1,
        savedScale: 2,
        savedX: -50,
        savedY: -20,
      }),
    ).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it('zooms a double tap around the tapped point', () => {
    expect(getDoubleTapTransform({ focalX: 30, focalY: -10 })).toEqual({
      scale: 2,
      x: -30,
      y: 10,
    });
  });
});
