describe('toShadowStyle', () => {
  let toShadowStyle: (shadow: any) => Record<string, any>;

  beforeAll(() => {
    toShadowStyle = require('../src/shadowStyle').toShadowStyle;
  });

  it('maps all five shadow properties', () => {
    const shadow = {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    };
    const result = toShadowStyle(shadow);
    expect(result.shadowColor).toBe('#000');
    expect(result.shadowOffset).toEqual({ width: 0, height: 2 });
    expect(result.shadowOpacity).toBe(0.15);
    expect(result.shadowRadius).toBe(4);
    expect(result.elevation).toBe(3);
  });

  it('returns a plain object (spreadable into ViewStyle)', () => {
    const shadow = {
      shadowColor: '#fff',
      shadowOffset: { width: 1, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    };
    const result = toShadowStyle(shadow);
    expect(typeof result).toBe('object');
    expect(Array.isArray(result)).toBe(false);
  });
});
