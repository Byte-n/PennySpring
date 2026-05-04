describe('genFontWeightMap', () => {
  let genFontWeightMap: (fontWeight: number) => Record<string, number>;

  beforeAll(() => {
    genFontWeightMap = require('../src/algorithms/genFontWeightMap').genFontWeightMap;
  });

  it('generates standard font weights from default seed', () => {
    const result = genFontWeightMap(400);

    expect(result).toEqual({
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightSemiBold: 600,
      fontWeightBold: 700,
    });
  });

  it('shifts font weights from a custom seed', () => {
    const result = genFontWeightMap(500);

    expect(result).toEqual({
      fontWeightLight: 400,
      fontWeightRegular: 500,
      fontWeightMedium: 600,
      fontWeightSemiBold: 700,
      fontWeightBold: 800,
    });
  });

  it('clips font weights to the React Native supported lower bound', () => {
    const result = genFontWeightMap(100);

    expect(result.fontWeightLight).toBe(100);
    expect(result.fontWeightRegular).toBe(100);
    expect(result.fontWeightMedium).toBe(200);
    expect(result.fontWeightSemiBold).toBe(300);
    expect(result.fontWeightBold).toBe(400);
  });
});
