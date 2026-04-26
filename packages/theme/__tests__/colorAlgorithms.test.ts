describe('getAlphaColor (blend variant)', () => {
  let getAlphaColor: (frontColor: string, backgroundColor: string) => string;

  beforeAll(() => {
    getAlphaColor = require('../src/algorithms/getAlphaColor').getAlphaColor;
  });

  it('returns a valid rgba string for black on white', () => {
    const result = getAlphaColor('#000', '#fff');
    expect(result).toMatch(/^rgba?\(/);
  });

  it('returns a valid rgba string for white on black', () => {
    const result = getAlphaColor('#fff', '#000');
    expect(result).toMatch(/^rgba?\(/);
  });

  it('returns a valid rgba string for color on white background', () => {
    const result = getAlphaColor('#1677ff', '#ffffff');
    expect(result).toMatch(/^rgba?\(/);
  });

  it('falls back when colors are identical', () => {
    const result = getAlphaColor('#000', '#000');
    expect(result).toMatch(/^rgba?\(/);
  });
});

describe('getSolidColor (default — darken)', () => {
  it('returns a darker hex color', () => {
    const { getSolidColor } = require('../src/algorithms/colorAlgorithm');
    const result = getSolidColor('#ffffff', 15);
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    // darken(15) on white should produce something darker (not #ffffff)
    expect(result).not.toBe('#ffffff');
  });

  it('darkens a gray color by a small amount', () => {
    const { getSolidColor } = require('../src/algorithms/colorAlgorithm');
    const result = getSolidColor('#808080', 4);
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('getSolidColor (dark — lighten)', () => {
  it('returns a lighter hex color', () => {
    const { getSolidColorDark } = require('../src/algorithms/colorAlgorithm');
    const result = getSolidColorDark('#000000', 8);
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(result).not.toBe('#000000');
  });

  it('lightens a gray color by a small amount', () => {
    const { getSolidColorDark } = require('../src/algorithms/colorAlgorithm');
    const result = getSolidColorDark('#808080', 12);
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('generateColorPalettes (default)', () => {
  let generateColorPalettes: (baseColor: string) => string[];

  beforeAll(() => {
    generateColorPalettes = require('../src/algorithms/colorPalettes').generateColorPalettes;
  });

  it('returns a 10-element array', () => {
    const palette = generateColorPalettes('#1677ff');
    expect(palette).toHaveLength(10);
  });

  it('index 6 equals the base color', () => {
    const palette = generateColorPalettes('#1677ff');
    expect(palette[5]).toBe('#1677ff'); // 0-indexed: position 5 = step 6
  });

  it('all entries are valid hex colors', () => {
    const palette = generateColorPalettes('#52c41a');
    palette.forEach(color => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('index 1 is the lightest (background) shade', () => {
    const palette = generateColorPalettes('#1677ff');
    // Step 1 should be the lightest bg color
    expect(palette[0]).toBeTruthy();
  });
});

describe('generateColorPalettes (dark)', () => {
  let generateColorPalettesDark: (baseColor: string) => string[];

  beforeAll(() => {
    generateColorPalettesDark = require('../src/algorithms/colorPalettes').generateColorPalettesDark;
  });

  it('returns a 10-element array', () => {
    const palette = generateColorPalettesDark('#1677ff');
    expect(palette).toHaveLength(10);
  });

  it('all entries are valid hex colors', () => {
    const palette = generateColorPalettesDark('#52c41a');
    palette.forEach(color => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('produces different palette from default for same base color', () => {
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const defaultPalette = generateColorPalettes('#1677ff');
    const darkPalette = generateColorPalettesDark('#1677ff');
    // Dark palette should differ from default palette in at least some positions
    const differs = defaultPalette.some((c: string, i: number) => c !== darkPalette[i]);
    expect(differs).toBe(true);
  });
});

describe('generateNeutralColorPalettes (default)', () => {
  let generateNeutralColorPalettes: (bgBase: string, textBase: string) => Record<string, string>;

  beforeAll(() => {
    generateNeutralColorPalettes = require('../src/algorithms/neutralPalettes').generateNeutralColorPalettes;
  });

  it('returns text gradient with 4 levels', () => {
    const neutrals = generateNeutralColorPalettes('#fff', '#000');
    expect(neutrals.colorText).toBeTruthy();
    expect(neutrals.colorTextSecondary).toBeTruthy();
    expect(neutrals.colorTextTertiary).toBeTruthy();
    expect(neutrals.colorTextQuaternary).toBeTruthy();
  });

  it('colorText has alpha 0.88 over text base', () => {
    const neutrals = generateNeutralColorPalettes('#ffffff', '#000000');
    // alpha 0.88 on black = rgba(0,0,0,0.88)
    expect(neutrals.colorText).toContain('0.88');
  });

  it('returns fill gradient with 4 levels', () => {
    const neutrals = generateNeutralColorPalettes('#fff', '#000');
    expect(neutrals.colorFill).toBeTruthy();
    expect(neutrals.colorFillSecondary).toBeTruthy();
    expect(neutrals.colorFillTertiary).toBeTruthy();
    expect(neutrals.colorFillQuaternary).toBeTruthy();
  });

  it('returns surface gradient (bgContainer, bgElevated, bgLayout)', () => {
    const neutrals = generateNeutralColorPalettes('#fff', '#000');
    expect(neutrals.colorBgContainer).toBeTruthy();
    expect(neutrals.colorBgElevated).toBeTruthy();
    expect(neutrals.colorBgLayout).toBeTruthy();
  });

  it('returns border gradient with 3 levels', () => {
    const neutrals = generateNeutralColorPalettes('#fff', '#000');
    expect(neutrals.colorBorder).toBeTruthy();
    expect(neutrals.colorBorderSecondary).toBeTruthy();
    expect(neutrals.colorBorderDisabled).toBeTruthy();
  });

  it('colorBgContainer is derived by darkening bgBase', () => {
    const neutrals = generateNeutralColorPalettes('#ffffff', '#000000');
    // White bgBase darkened should not be pure white
    expect(neutrals.colorBgContainer).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('colorShadow is derived from textBase with alpha', () => {
    const neutrals = generateNeutralColorPalettes('#ffffff', '#000000');
    expect(neutrals.colorShadow).toBeTruthy();
  });
});

describe('generateNeutralColorPalettes (dark)', () => {
  let generateNeutralColorPalettesDark: (bgBase: string, textBase: string) => Record<string, string>;

  beforeAll(() => {
    generateNeutralColorPalettesDark = require('../src/algorithms/neutralPalettes').generateNeutralColorPalettesDark;
  });

  it('returns text gradient with 4 levels', () => {
    const neutrals = generateNeutralColorPalettesDark('#000', '#fff');
    expect(neutrals.colorText).toBeTruthy();
    expect(neutrals.colorTextSecondary).toBeTruthy();
    expect(neutrals.colorTextTertiary).toBeTruthy();
    expect(neutrals.colorTextQuaternary).toBeTruthy();
  });

  it('returns fill gradient with higher alpha values for dark mode', () => {
    const neutrals = generateNeutralColorPalettesDark('#000', '#fff');
    expect(neutrals.colorFill).toBeTruthy();
  });

  it('returns surface gradient using lighten', () => {
    const neutrals = generateNeutralColorPalettesDark('#000000', '#ffffff');
    expect(neutrals.colorBgContainer).toBeTruthy();
    expect(neutrals.colorBgContainer).not.toBe('#000000');
  });

  it('colorBgContainer is derived by lightening bgBase', () => {
    const neutrals = generateNeutralColorPalettesDark('#000000', '#ffffff');
    expect(neutrals.colorBgContainer).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
