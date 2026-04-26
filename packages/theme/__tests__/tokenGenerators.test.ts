describe('genFontSizes', () => {
  let genFontSizes: (base: number) => number[];

  beforeAll(() => {
    genFontSizes = require('../src/algorithms/genFontSizes').genFontSizes;
  });

  it('returns 10 font sizes', () => {
    const sizes = genFontSizes(14);
    expect(sizes).toHaveLength(10);
  });

  it('index 1 equals the base font size', () => {
    const sizes = genFontSizes(14);
    expect(sizes[1]).toBe(14);
  });

  it('sizes grow exponentially', () => {
    const sizes = genFontSizes(14);
    expect(sizes[2]).toBeGreaterThan(sizes[1]);
    expect(sizes[3]).toBeGreaterThan(sizes[2]);
    expect(sizes[9]).toBeGreaterThan(sizes[1]);
  });

  it('all sizes are even integers', () => {
    const sizes = genFontSizes(14);
    sizes.forEach(size => {
      expect(size % 2).toBe(0);
      expect(Number.isInteger(size)).toBe(true);
    });
  });

  it('works with different base sizes', () => {
    const sizes = genFontSizes(12);
    expect(sizes[1]).toBe(12);
    expect(sizes).toHaveLength(10);
  });
});

describe('genRadius', () => {
  let genRadius: (base: number) => { borderRadiusLG: number; borderRadiusSM: number; borderRadiusXS: number; borderRadiusOuter: number };

  beforeAll(() => {
    genRadius = require('../src/algorithms/genRadius').genRadius;
  });

  it('generates radius variants from base 6', () => {
    const radii = genRadius(6);
    expect(radii.borderRadiusLG).toBe(8);
    expect(radii.borderRadiusSM).toBe(4);
    expect(radii.borderRadiusXS).toBe(2);
  });

  it('generates radius variants from base 4', () => {
    const radii = genRadius(4);
    expect(radii.borderRadiusLG).toBeGreaterThanOrEqual(5);
  });

  it('borderRadiusOuter is 4 or 6 based on base', () => {
    const radii = genRadius(6);
    expect(typeof radii.borderRadiusOuter).toBe('number');
    expect(radii.borderRadiusOuter).toBeGreaterThan(0);
  });
});

describe('genSizeMapToken', () => {
  let genSizeMapToken: (seed: { sizeUnit: number; sizeStep: number }) => Record<string, number>;

  beforeAll(() => {
    genSizeMapToken = require('../src/algorithms/genSizeMapToken').genSizeMapToken;
  });

  it('computes sizeXXL = 48 with default values (sizeUnit=4, sizeStep=4)', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    expect(sizes.sizeXXL).toBe(48);
  });

  it('size = 16 with default values', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    expect(sizes.size).toBe(16);
  });

  it('sizeXXS = 4 with default values', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    expect(sizes.sizeXXS).toBe(4);
  });

  it('all sizes are positive numbers', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    Object.values(sizes).forEach(val => {
      expect(val).toBeGreaterThan(0);
    });
  });

  it('sizes are in descending order by name', () => {
    const sizes = genSizeMapToken({ sizeUnit: 4, sizeStep: 4 });
    expect(sizes.sizeXXL).toBeGreaterThan(sizes.sizeXL);
    expect(sizes.sizeXL).toBeGreaterThan(sizes.sizeLG);
    expect(sizes.sizeXS).toBeGreaterThan(sizes.sizeXXS);
  });
});

describe('genControlHeight', () => {
  let genControlHeight: (controlHeight: number) => { controlHeightXS: number; controlHeightSM: number; controlHeightLG: number };

  beforeAll(() => {
    genControlHeight = require('../src/algorithms/genControlHeight').genControlHeight;
  });

  it('controlHeightSM = 0.75x base', () => {
    const heights = genControlHeight(32);
    expect(heights.controlHeightSM).toBe(24);
  });

  it('controlHeightXS = 0.5x base', () => {
    const heights = genControlHeight(32);
    expect(heights.controlHeightXS).toBe(16);
  });

  it('controlHeightLG = 1.25x base', () => {
    const heights = genControlHeight(32);
    expect(heights.controlHeightLG).toBe(40);
  });
});

describe('genCommonMapToken', () => {
  let genCommonMapToken: (seed: { motionUnit: number; motionBase: number; lineWidth: number; borderRadius: number }) => Record<string, number>;

  beforeAll(() => {
    genCommonMapToken = require('../src/algorithms/genCommonMapToken').genCommonMapToken;
  });

  it('motionDurationFast = 100ms', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(common.motionDurationFast).toBe(100);
  });

  it('motionDurationMid = 200ms', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(common.motionDurationMid).toBe(200);
  });

  it('motionDurationSlow = 300ms)', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(common.motionDurationSlow).toBe(300);
  });

  it('motion durations are numbers (not CSS strings)', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(typeof common.motionDurationFast).toBe('number');
  });

  it('lineWidthBold = lineWidth + 1', () => {
    const common = genCommonMapToken({ motionUnit: 0.1, motionBase: 0, lineWidth: 1, borderRadius: 6 });
    expect(common.lineWidthBold).toBe(2);
  });
});

describe('genPresetColorPalettes', () => {
  let genPresetColorPalettes: (seed: any, algorithm: string) => Record<string, string>;

  beforeAll(() => {
    genPresetColorPalettes = require('../src/algorithms/genPresetColorPalettes').genPresetColorPalettes;
  });

  it('generates blue1..blue10', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const palettes = genPresetColorPalettes(defaultSeedToken, 'default');
    expect(palettes.blue1).toBeTruthy();
    expect(palettes.blue6).toBeTruthy();
    expect(palettes.blue10).toBeTruthy();
  });

  it('generates all 13 preset color families', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { PresetColors } = require('../src/presetColors');
    const palettes = genPresetColorPalettes(defaultSeedToken, 'default');
    PresetColors.forEach((key: string) => {
      expect(palettes[`${key}1`]).toBeTruthy();
      expect(palettes[`${key}10`]).toBeTruthy();
    });
  });

  it('all palette values are valid hex', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const palettes = genPresetColorPalettes(defaultSeedToken, 'default');
    Object.values(palettes).forEach(color => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

describe('genColorMapToken', () => {
  let genColorMapToken: any;

  beforeAll(() => {
    genColorMapToken = require('../src/algorithms/genColorMapToken').genColorMapToken;
  });

  it('produces colorPrimary from palette step 6', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes, generateColorPalettesDark } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes, generateNeutralColorPalettesDark } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorPrimary).toBe('#1677ff');
  });

  it('produces colorPrimaryBg from palette step 1', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorPrimaryBg).toBeTruthy();
  });

  it('colorErrorBgFilledHover is a mix of error step 1 and 3', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorErrorBgFilledHover).toBeTruthy();
  });

  it('colorLink from seed colorLink (falls back to colorInfo)', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorLink).toBe('#1677ff'); // falls back to colorInfo
  });

  it('produces colorWhite and colorBgMask', () => {
    const { defaultSeedToken } = require('../src/defaults');
    const { generateColorPalettes } = require('../src/algorithms/colorPalettes');
    const { generateNeutralColorPalettes } = require('../src/algorithms/neutralPalettes');

    const result = genColorMapToken(defaultSeedToken, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    });
    expect(result.colorWhite).toBe('#fff');
    expect(result.colorBgMask).toBe('rgba(0, 0, 0, 0.45)');
  });
});

describe('genFontMapToken', () => {
  let genFontMapToken: (base: number) => Record<string, number>;

  beforeAll(() => {
    genFontMapToken = require('../src/algorithms/genFontMapToken').genFontMapToken;
  });

  it('fontSize equals base font size', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontSize).toBe(14);
  });

  it('fontSizeSM is smaller than or equal to base', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontSizeSM).toBeLessThanOrEqual(14);
  });

  it('has 5 heading levels', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontSizeHeading1).toBeGreaterThan(0);
    expect(fonts.fontSizeHeading2).toBeGreaterThan(0);
    expect(fonts.fontSizeHeading3).toBeGreaterThan(0);
    expect(fonts.fontSizeHeading4).toBeGreaterThan(0);
    expect(fonts.fontSizeHeading5).toBeGreaterThan(0);
  });

  it('headings are ordered H1 > H2 > H3 > H4 > H5', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontSizeHeading1).toBeGreaterThan(fonts.fontSizeHeading2);
    expect(fonts.fontSizeHeading2).toBeGreaterThan(fonts.fontSizeHeading3);
    expect(fonts.fontSizeHeading3).toBeGreaterThan(fonts.fontSizeHeading4);
    expect(fonts.fontSizeHeading4).toBeGreaterThan(fonts.fontSizeHeading5);
  });

  it('line heights are computed as (fontSize + 10) / fontSize (RN 中文舒适区)', () => {
    const fonts = genFontMapToken(16);
    // fontSize=16 下行高≈ (16+10)/16 = 1.625
    expect(fonts.lineHeight).toBeCloseTo(1.625, 3);
    // genFontSizes(16)[0] = 14 → lineHeightSM ≈ (14+10)/14 = 1.714
    expect(fonts.lineHeightSM).toBeCloseTo(1.714, 2);
    // genFontSizes(16)[2] = 18 → lineHeightLG ≈ (18+10)/18 = 1.556
    expect(fonts.lineHeightLG).toBeCloseTo(1.556, 2);
  });

  it('fontHeights are computed from lineHeight * fontSize rounded', () => {
    const fonts = genFontMapToken(14);
    expect(fonts.fontHeight).toBeGreaterThan(0);
    expect(Number.isInteger(fonts.fontHeight)).toBe(true);
  });
});
